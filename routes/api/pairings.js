var express = require('express')
var router = express.Router()
var debug = require('debug')('splor:api:students')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var models = require('../../lib/models')

var User = models.User
var Exercise = models.Exercise

/**
 * pairings for an exercise
 *
 * returns a mapping of student pairings for the specified exercise.
 */
router.get('/exercise/:id', function(req, res, next) {
  var teacher = req.user

  Exercise.findById(req.params.id)
  .catch(next)
  .then(function(exercise) {
    if (!exercise) return res.status(404).json({error: 'Not found.'})
    return exercise.getUsers(
      /* TODO: this should filter to the currently authenticated teacher */
    )
    .then(function(users) {
      if (users.length < 2) {
        return res.json({error: 'Not enough users have this exercise to find a match.'})
      }
      var mastered = []
      var struggling = []
      users.forEach(function(u) {
        if (u.skill.mastered) mastered.push(u)
        if (u.skill.struggling) struggling.push(u)
      })
      if (!mastered.length) return res.json({error: 'Not enough mastered users to generate pairings.'})
      if (!struggling.length) return res.json({error: 'Not enough struggling users to generate pairings.'})
      var matches = struggling.reduce(function(o, s) {
        if (!mastered.length) {
          o[s.username] = 'Unable to find a match.'
        } else {
          var helper = mastered.pop()
          o[s.username] = helper.username
        }
        return o
      }, {})
      res.json(matches)
    })
  })
})

router.get('/', function(req, res, next) {
  khan(req).request('/user/students')
    .then(function(students) {
      res.json(students)
    })
    .catch(next)
})

module.exports = router
