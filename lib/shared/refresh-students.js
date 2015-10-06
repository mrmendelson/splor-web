var debug = require('debug')('splor:refresh-students')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var async = require('async')
var models = require('../models')
var upsertUser = require('../shared/upsert-user')
var Promise = require('bluebird')

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
      if (!user) return debug('user not found.')
      debug('refreshing users as user ' + JSON.stringify(user))
      refresh.withUser(user, next)
    })
}
// TODO: refactor to use promises correctly
refresh.withUser = function(teacher, next) {
  var khan = khanAPI(teacher.khanSecret, teacher.khanToken)
  khan.request('/user/students')
  .then(function(students) {
    debug('refreshing ' + (students.length || 0) + ' students...')
    return students.length ? students : []
  })
  .map(function(student) {
    return new Promise(function(resolve, reject) {
      upsertUser(student, function(err, userInfo, user) {
        if (err) return reject(err)
        resolve(user)
      })
    })
  }, {concurrency: MAX_CONCURRENT_STUDENTS})
  .each(function(student) {
    debug('requesting exercises for user ' + student.id)
    return khan.request('/user/exercises', { kaid: student.khanId })
    .then(function(exercises) {
      if (!exercises.length) exercises = []
      return Promise.map(exercises, function(info) {
        return Exercise.upsert({
          khan_id: info.exercise_model.id,
          URL: info.exercise_model.ka_url,
          name: info.exercise_model.pretty_display_name,
          kind: info.exercise_model.kind
        })
        .then(function() {
          return Exercise.findById(info.exercise_model.id)
        })
        .then(function(ex) {
          return student.addExercise(ex, {
            struggling: info.exercise_states.struggling,
            proficient: info.exercise_states.proficient,
            practiced: info.exercise_states.practiced,
            mastered: info.exercise_states.mastered
          })
        })
      })
    })
  })
  .then(function(students) {
    teacher
    .setStudents(students)
    .then(function() {
      debug('completed - updated ' + students.length + ' users.')
      next(null, students)
    })
  })
  .catch(function(err) {
    try {
      next(new Error(err.response.error.text))
    } catch (e) {
      next(err)
    }
  })
}

module.exports = refresh
