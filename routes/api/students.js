var express = require('express')
var router = express.Router()
var debug = require('debug')('splor:api:students')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var async = require('async')
var User = require('../../lib/models/User')
var Exercise = require('../../lib/models/Exercise')
var upsertUser = require('../../lib/shared/upsert-user')

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

/**
 * Refresh
 *
 * Refreshes all local data about students and their exercises, so our local calculations will be correct.
 */

router.get('/refresh', function(req, res, next) {
  console.log('refreshing students')
  khan(req).request('/user/students')
    .then(function(students) {
      if (!students) return
      console.log('got students')
      async.map(students, function(student, done) {
        console.log('mapping a student')
        upsertUser(student, function(err, userInfo, user) {
          if (err) return done(err)
          khan(req).request('/user/exercises', { kaid: userInfo.khanId })
            .then(function(exercises) {
              if (!exercises) return
              if (exercises.hasOwnProperty('[]')) return done(null, [])
              console.log('got exercises', exercises)
              // TODO: clear out user exercises
              user.getExercises().then(function(exercises) {
                console.log('TODO: CLEAR EXERCISES: ', exercises)
              })
              async.map(exercises, function(info, done) {
                console.log(info)
                Exercise.create({
                  khan_id: info.exercise_model.id,
                  URL: info.exercise_model.ka_url,
                  name: info.exercise_model.pretty_display_name,
                  kind: info.exercise_model.kind,
                  struggling: info.exercise_states.struggling,
                  proficient: info.exercise_states.proficient,
                  practiced: info.exercise_states.practiced,
                  mastered: info.exercise_states.mastered
                })
                .catch(done)
                .then(function(ex) { done(null, ex) })
              }, function(err, exs) {
                if (err) return done(err)
                user.setExercises(exs)
                  .catch(done)
                  .then(function() {
                    if (!students) return
                    done(null, user)
                  })
              })
            })
            .catch(done)
        })
      }, function(err, users) {
        console.log('student errir', err)
        if (err) return next(err)
        var userList = users.map(JSON.stringify)
        res.json(userList)
      })
    })
    .catch(next)
})

// User specific requests

router.get('/:kaid', function(req, res, next) {
  idRequest('/user', req, res, next)
})

router.get('/exercises/:kaid', function(req, res, next) {
  idRequest('/user/exercises', req, res, next)
})

module.exports = router
