var debug = require('debug')('splor:refresh-students')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var async = require('async')
var User = require('../models/User')
var Exercise = require('../models/Exercise')
var upsertUser = require('../shared/upsert-user')

/* constants */
var MAX_CONCURRENT_STUDENTS = 100

/**
 * Refresh students
 *
 * Refreshes all local data about students and their exercises, so our local calculations will be correct.
 */

var refresh = {}

refresh.withId = function(id, next) {
  User.findById(id)
    .catch(next)
    .then(function(user) {
      if (!user) return
      user = user.get()
      debug('refreshing users as user ' + JSON.stringify(user))
      refresh.withUser(user, next)
    })
}

refresh.withUser = function(user, next) {
  var khan = khanAPI(user.khanSecret, user.khanToken)
  khan.request('/user/students')
    .then(function(students) {
      if (!students) return
      if (!students.length) return next(null, [])
      var toProcess = students.length
      debug('refreshing ' + toProcess + ' students...')
      async.mapLimit(students, MAX_CONCURRENT_STUDENTS, function(student, complete) {
        var done = function() {
          debug(--toProcess + ' students left...')
          complete.apply(this, arguments)
        }
        upsertUser(student, function(err, userInfo, user) {
          if (err) {
            debug('error upserting user:', err.message, err.stack, JSON.stringify(student))
            return done(null, null)
          }
          debug('requesting exercises for user ' + userInfo.id)
          khan.request('/user/exercises', { kaid: userInfo.khanId })
            .catch(function(err) {
              debug('error requesting exercises:', err.message, err.stack, JSON.stringify(userInfo))
              done()
            })
            .then(function(exercises) {
              if (!exercises) return
              if (!exercises.length) {
                debug('user ' + userInfo.id + ' has no exercises, skipping.')
                return done(null, user)
              }
              // TODO: need to delete the previous exercises here, this just un-associates them.
              user.setExercises([])
                .catch(function(err) {
                  debug('error removing exercises from user:', err.message, err.stack, JSON.stringify(userInfo))
                  done(null, user)
                })
                .then(function() {
                  async.map(exercises, function(info, done) {
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
                    .then(function(ex) {
                      if (!ex) return
                      done(null, ex)
                    })
                    .catch(function(err) {
                      debug('error creating exercise:', err.message, err.stack, JSON.stringify(info), JSON.stringify(userInfo))
                      done()
                    })
                  }, function(err, exs) {
                    if (err) {
                      debug('error creating exercises:', err.message, err.stack, JSON.stringify(exercises), JSON.stringify(userInfo))
                      return done(null, user)
                    }
                    var totalExs = exs.length
                    exs = exs.filter(function(e) { return !!e })
                    user.setExercises(exs)
                      .catch(function(err) {
                        debug('error setting user exercises:', err.message, err.stack, JSON.stringify(userInfo))
                        done(null, user)
                      })
                      .then(function(r) {
                        if (!r) return
                        debug('successfully associated ' + exs.length + '/' + totalExs + ' with user ' + userInfo.id + ' (' +userInfo.khanId+ ')' + '.')
                        done(null, user)
                      })
                  })
                })
              })
        })
      }, function(err, users) {
        debug('done processing users.')
        if (err) return next(err)
        var userList = users.filter(function(u) { return !!u }).map(JSON.stringify)
        next(null, userList)
      })
    })
    .catch(next)
}

module.exports = refresh
