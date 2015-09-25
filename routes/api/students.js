var express = require('express')
var router = express.Router()
var debug = require('debug')('splor:api:students')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var User = require('../../lib/models').User

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


// Deprecated: Khan requests (above will supercede)

function idRequest(path, req, res, next) {
  var id = req.params.kaid
  var params = req.query || {}
  if (/^kaid_/.test(id)) {
    params.kaid = id
    khan(req).request(path, params)
      .then(function(response) {
        // console.log('request to ' + path, response[0])
        if (response) res.json(response)
      })
      .catch(next)
  } else {
    return next(new Error('Unsupported id passed. You must pass an id starting with "kaid_".'))
  }
}

router.get('/:kaid', function(req, res, next) {
  idRequest('/user', req, res, next)
})

router.get('/exercises/:kaid', function(req, res, next) {
  idRequest('/user/exercises', req, res, next)
})

module.exports = router
