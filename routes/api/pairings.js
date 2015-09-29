var express = require('express')
var router = express.Router()
var debug = require('debug')('splor:api:students')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var models = require('../../lib/models')
var async = require('async')
var Promise = require('bluebird')

var User = models.User
var Exercise = models.Exercise
var Pairing = models.Pairing

function generatePairings(users) {
  var mastered = []
  var struggling = []
  users.forEach(function(u) {
    if (u.Skill.mastered) mastered.push(u)
    if (u.Skill.struggling) struggling.push(u)
  })
  if (!mastered.length) return [] //'Not enough mastered users to generate pairings.'
  if (!struggling.length) return [] //'Not enough struggling users to generate pairings.'
  var matches = struggling.reduce(function(o, s) {
    if (mastered.length) {
      var helper = mastered.pop()
      o.push({
        tutee: s,
        tutor: helper
      })
    } else {
      // TODO: this is a struggling user, but we've already assigned all the mastered students. Is anything else necessary here?
    }
    return o
  }, [])
  return matches
}

function refreshPairings(exercise, callback) {
  exercise.setPairings([])
  // .then(function() {
  //   return Pairing.destroy({
  //     where: { ExerciseKhanId: exercise.khan_id }
  //   })
  // })
  .then(function() {
    var pairings = generatePairings(exercise.Users)
    async.map(pairings, function(pairing, done) {
      Pairing.create()
      .then(function(p) {
        return Promise.join(
          p.setTutor(pairing.tutor),
          p.setTutee(pairing.tutee),
          p.setExercise(exercise),
          exercise.addPairing(p)
        ).then(function() {
          done(null, p)
        })
      })
      .catch(function(err) {
        // console.warn('failed generating pairings for exercise ' + ex.id + ', ' + err.message)
        done(null)
      })
    }, callback)
  })
}

/**
 * refresh all pairings
 *
 * generates all pairings for all exercises.
 */
router.get('/refresh', function(req, res, next) {
  Exercise.findAll({
    include: User
  })
  .then(function(exercises) {
    async.reduce(exercises, 0, function(memo, p, done) {
      refreshPairings(p, function(err, pairings) {
        if (err) {
          console.log('ERROR:', err.message)
          console.log(err.sql)
          console.log(err.stack)
        }
        done(null, memo + (err ? 0 : pairings.filter(function(p) { return !!p }).length))
      })
    }, function(err, count) {
      if (err) return next(err)
      return res.json({message: 'successfully refreshed ' + exercises.length + ' exercises, creating ' + count + ' pairings.'})
    })
  })
})

module.exports = router
