var debug = require('debug')('splor:refresh-students')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var async = require('async')
var models = require('../models')
var upsertUser = require('../shared/upsert-user')
var Promise = require('bluebird')
var redisClient = require('lib/redis-client')
var User = models.User
var Class = models.Class
var Exercise = models.Exercise
var KhanCoach = models.KhanCoach
var KhanAuthEmail = models.KhanAuthEmail

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

var idMap = function(o, item) {
  o[item.id] = item
  return o
}

refresh.withUser = function(teacher, jobId) {
  var next = function(err) {
    if (err) {
      debug('ERROR: ' + err.message)
      console.log(err.stack)
    }
  }
  if (typeof jobId === 'function') {
    next = jobId
    jobId = null
  }
  var totalStudents = 0
  var processedStudents = 0
  var khan = khanAPI(teacher.khanSecret, teacher.khanToken)
  khan.request('/user/students')
  .then(function(students) {
    totalStudents = students.length || 0
    debug('refreshing ' + (totalStudents) + ' students...')
    return students.length ? students : []
  })
  .map(function(student) {
    return new Promise(function(resolve, reject) {
      upsertUser(student, function(err, userInfo, user) {
        if (err) return reject(err)
        var currentTeachers = user.Teachers.reduce(idMap, {})
        Promise.join(
          KhanAuthEmail.findAll({
            where: {
              email: { $in: student.coaches }
            },
            include: {
              model: User
            }
          }),
          User.findAll({
            where: {
              khanLongId: { $in: student.coaches }
            }
          })
        )
        .spread(function(emails, users) {
          // get all the matched emails and users
          var teachers = (emails || []).map(e => e.User).concat(users || [])
          // always add the current user as a teacher
          teachers.push(teacher)
          // unique teachers
          var tIDs = {}
          teachers = teachers.reduce((a, t) => {
            if (tIDs[t.id]) return a
            tIDs[t.id] = true
            a.push(t)
            return a
          }, [])
          var clen = student.coaches.length
          if (clen) console.log(`user had ${clen} coaches, found ${teachers.length} on splor.`)
          // find removed teachers
          var newTeachers = teachers.reduce(idMap, {})
          var removedTeachers = Object.keys(currentTeachers).filter(function(id) {
            return !newTeachers[id]
          }).map(function(id) { return currentTeachers[id] })
          // for each removed teacher, find their classes and remove this student from them.
          return Promise.all(removedTeachers.map(function(teacher) {
            return Class.findAll({
              where: { 'TeacherId': teacher.id }
            }).each(function(aClass) {
              return aClass.removeStudent(user)
            })
          })).then(function() {
            return user.setTeachers(teachers)
          })
        }).then(function() {
          resolve(user)
        })
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
    .then(function() {
      if (jobId) {
        return redisClient.setAsync(jobId, (++processedStudents) + '/' + totalStudents)
      }
    })
  })
  .then(function(students) {
    return teacher.update({
      lastRefresh: new Date()
    })
    .then(function() {
      return redisClient.setAsync(jobId, 'completed')
    })
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
