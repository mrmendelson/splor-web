var express = require('express')
var router = express.Router()
var debug = require('debug')('splor:api:students')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var models = require('lib/models')
var Exercise = models.Exercise
var User = models.User
var refreshStudents = require('lib/shared/refresh-students')
var redisClient = require('lib/redis-client')
var uuid = require('node-uuid')

function khan(req) {
  var user = req.user
  return khanAPI(user.khanSecret, user.khanToken)
}

router.get('/', function(req, res, next) {
  khan(req).request('/user/students')
    .then(function(students) {
      res.json(students)
    })
    .catch(next)
})

/**
 * refresh students
 *
 * Fetches all students from khan academy and stores them in our database.
 */
router.post('/refresh', function(req, res, next) {
  // generate a job id
  var jobuuid = uuid.v1()
  var jobId = 'refresh:' + jobuuid
  // add a job to our redis queue to track that we're starting
  redisClient.set(jobId, 'starting', function(err) {
    if (err) return res.status(500).json({error: err.message})
    // kick off our refresh job
    refreshStudents.withUser(req.user, jobId)
    // respond to the user with a job ID that can be polled
    res.json({ jobId: jobuuid })
  })
})

/**
 * get refresh job status
 *
 * Sends back the current status of a refresh job.
 */
router.all('/refresh/:jobuuid', function(req, res, next) {
  var jobId = 'refresh:' + req.params.jobuuid
  redisClient.getAsync(jobId)
  .then(function(status) {
    if (status) {
      var payload = { status: status }
      if (status === 'completed') payload.message = 'Finished refreshing students.'
      return res.json(payload)
    }
    res.json({ error: 'unknown job' })
  })
  .catch(next)
})

/*
 * :id
 *
 * Shows the specified user, including their exercises.
 */
router.get('/:id', function(req, res, next) {
  User.findById(req.params.id, {
    include: [{
        model: Exercise,
        as: 'Exercises'
    }]
  })
  .then(function(user) {
    if (user) res.json(user)
  })
  .catch(next)
})

module.exports = router
