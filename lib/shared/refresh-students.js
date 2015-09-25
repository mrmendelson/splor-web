var debug = require('debug')('splor:refresh-students')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var async = require('async')
var models = require('../models')
var upsertUser = require('../shared/upsert-user')

var User = models.User
var Exercise = models.Exercise

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
      debug('refreshing users as user ' + JSON.stringify(user))
      refresh.withUser(user, next)
    })
}

// TODO: only have one exercise per khan exercise ID, and associate to many users via a join table with mastery data.

refresh.withUser = function(teacher, next) {
  var khan = khanAPI(teacher.khanSecret, teacher.khanToken)
  khan.request('/user/students')
    .then(function(students) {
      // students = [students[155]]
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
          return khan.request('/user/exercises', { kaid: userInfo.khanId })
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
            async.map(exercises, function(info, eDone) {
              Exercise.upsert({
                khan_id: info.exercise_model.id,
                URL: info.exercise_model.ka_url,
                name: info.exercise_model.pretty_display_name,
                kind: info.exercise_model.kind
              })
              .catch(function(err) {
                debug('error creating exercise:', err.message, err.stack, JSON.stringify(info), JSON.stringify(userInfo))
                eDone()
              })
              .then(function(created) {
                Exercise.findById(info.exercise_model.id)
                .catch(eDone)
                .then(function(ex) {
                  user.addExercise(ex, {
                    struggling: info.exercise_states.struggling,
                    proficient: info.exercise_states.proficient,
                    practiced: info.exercise_states.practiced,
                    mastered: info.exercise_states.mastered
                  })
                  .catch(function(err) {
                    debug('error setting user exercise:', err.message, err.stack, JSON.stringify(userInfo), JSON.stringify(ex))
                    eDone(null, user)
                  })
                  .then(function(r) {
                    eDone(null, ex)
                  })
                })
              })
            }, function(err, exs) {
              if (err) {
                debug('error creating exercises:', err.message, err.stack, JSON.stringify(exercises), JSON.stringify(userInfo))
                return done(null, user)
              }
              var totalExs = exs.length
              exs = exs.filter(function(e) { return !!e })
              debug('successfully associated ' + exs.length + '/' + totalExs + ' with user ' + userInfo.id + ' (' +userInfo.khanId+ ')' + '.')
              done(null, user)
            })
          })
        })
      }, function(err, users) {
        if (err) {
          debug('error returned from student map: ' + err.message, err.stack)
          return next(err)
        }
        debug('done processing users, adding as students.')
        teacher
        .setStudents(users)
        .then(function() {
          debug('completed - updated ' + users.length + ' users.')
          var userList = users.filter(function(u) { return !!u }).map(JSON.stringify)
          next(null, userList)
        })
        .catch(next)
      })
    })
    .catch(next)
}

module.exports = refresh
