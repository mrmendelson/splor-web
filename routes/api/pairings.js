var express = require('express')
var router = express.Router()
var debug = require('debug')('splor:api:students')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var models = require('lib/models')
var async = require('async')
var Promise = require('bluebird')
var shuffle = require('knuth-shuffle').knuthShuffle

var User = models.User
var Exercise = models.Exercise
var Pairing = models.Pairing
var Class = models.Class

/**
 * generatePairings - generates pairings for students based on an exercise
 * @param  {object} studentMap : a map of studentId: Student
 * @param  {Exercise} exercise : an exercise
 * @param  {object} pairedUsers: a map of studentId: pairing - if a user is in this map, they will not be paired.
 * @return {array}             : an array of pairings, where each node is an object with a "tutor" and "tutee" key for this exercise
 */
function generatePairings(studentMap, pairedUsers, exercise) {
  var mastered = []
  var struggling = []
  // get a map of studentId: { skill: Skill, student: User } object pairings
  var skillMap = Object.keys(studentMap).reduce(function(o, id) {
    var student = studentMap[id]
    var len = student.Exercises.length
    for (var i = 0; i < len; i++) {
      var e = student.Exercises[i]
      if (e.khan_id === exercise.khan_id) {
        o[id] = { skill: e.Skill, student: student }
        break
      }
    }
    return o
  }, {})
  // loop through each skill and bucket them to either mastered or struggling
  Object.keys(skillMap).forEach(function(id) {
    var info = skillMap[id]
    var student = info.student
    var skill = info.skill
    // skip already paired users
    if (pairedUsers[student.id]) return
    if (skill.mastered) mastered.push(info.student)
    if (skill.struggling) struggling.push(info.student)
  })
  // make sure we have at least one of each mastered and struggling
  if (!mastered.length) return [] //'Not enough mastered users to generate pairings.'
  if (!struggling.length) return [] //'Not enough struggling users to generate pairings.'
  // randomize the students by shuffling them (Fisher-Yates: http://bost.ocks.org/mike/shuffle/)
  shuffle(mastered)
  shuffle(struggling)
  // create matches by looping through our struggling students and popping a mastered student until we run out of either.
  var len = struggling.length
  var pairings = []
  for (var i = 0; i < len; i++) {
    if (mastered.length) {
      var tutor = mastered.pop()
      pairings.push({
        tutee: struggling[i],
        tutor: tutor
      })
    } else {
      // we ran out of mastered students, stop looping.
      // TODO: should we indicate somewhere that this user is struggling but doesn't have a helper?
      break
    }
  }
  return pairings
}

function refreshPairings(exerciseInfo, c, pairedUsers, callback) {
  var exercise = exerciseInfo.exercise
  var studentMap = exerciseInfo.studentMap
  Pairing.destroy({
    where: { ExerciseKhanId: exercise.khan_id }
  })
  .then(function() {
    return exercise.setPairings([])
  })
  .then(function() {
    var pairings = generatePairings(studentMap, pairedUsers, exercise)
    async.map(pairings, function(pairing, done) {
      Pairing.create()
      .then(function(p) {
        return Promise.join(
          p.setClass(c),
          p.setTutor(pairing.tutor),
          p.setTutee(pairing.tutee),
          p.setExercise(exercise),
          exercise.addPairing(p)
        ).then(function() {
          done(null, p)
        })
      })
      .catch(function(err) {
        debug('failed generating pairings for exercise ' + exercise.id + ', ' + err.message)
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
function refreshClassPairings(teacherId, classId) {
  return Class.findOne({
    where: {
      id: classId
    },
    include: [{
      model: User,
      as: 'Students',
      include: [{
        model: Exercise
      }]
    }, {
      model: User,
      as: 'Teacher',
      where: { id: teacherId }
    }]
  })
  .then(function(c) {
    // TODO: this logic is a tad confusing, but we're working on the assumption that:
    // - Each student in the system will only be in one class
    // - Each exercise will only be contained in one class

    // build maps for exercises (khan_id: exercise), and exercise students (khan_id: { studentId: student })
    var exMap = {}
    var exStudents = c.Students.reduce(function(o, student) {
      student.Exercises.forEach(function(e) {
        o[e.khan_id] = o[e.khan_id] || {}
        // only add the user to exercises they are either struggling or mastered
        if (e.Skill.struggling || e.Skill.mastered) {
          o[e.khan_id][student.id] = student
          exMap[e.khan_id] = e
        }
      })
      return o
    }, {})

    // get a list of exercises shared by more than one user
    var exercises = Object.keys(exStudents).reduce(function(a, id) {
      if (Object.keys(exStudents[id]).length > 1) {
        a.push({
          exercise: exMap[id],
          studentMap: exStudents[id]
        })
      }
      return a
    }, [])

    // randomize our exercises - this is importance since each user will be assigned only once each time we generate.
    shuffle(exercises)

    return new Promise(function(resolve, reject) {
      // get pairings for each of our exercises we have students that are struggling/mastered
      var pairedUsers = {}
      async.mapSeries(exercises, function(e, done) {
        refreshPairings(e, c, pairedUsers, function(err, pairings) {
          // remove any undefined pairings
          pairings = pairings.filter(function(p) { return !!p })
          if (err) {
            console.log('ERROR:', err.message)
            console.log(err.sql)
            console.log(err.stack)
          }
          // after we create a pairing, add all paired users to a map so they won't be assigned again.
          pairings.forEach(function(p) {
            pairedUsers[p.TutorId] = p
            pairedUsers[p.TuteeId] = p
          })
          done(null, pairings)
        })
      }, function(err, pairings) {
        if (err) return reject(err)
        pairings = pairings.filter(function(p) {
          return p.length > 0
        })
        resolve({
          exercises: exercises,
          pairings: pairings,
          class: c
        })
      })
    })

  })
}

router.post('/refresh/:classId', function(req, res, next) {
  refreshClassPairings(req.user.id, req.params.classId)
  .then(function(info) {
    var pairings = info.pairings
    var exercises = info.exercises
    var c = info.class
    var count = pairings.reduce(function(memo, p) { return memo + (p || []).length }, 0)
    var payload = {message: 'successfully refreshed ' + exercises.length + ' exercises, creating ' + count + ' pairings.'}
    var done = function() {
      res.json(payload)
    }
    if (req.query.renderPartial) {
      Pairing.findAll({
        where: {
          id: {
            $in: pairings.reduce(function(a, p) {
              return a.concat(p.map(function(p) { return p.id }))
            }, [])
          }
        },
        include: [{
          model: User,
          as: 'Tutor'
        },{
          model: User,
          as: 'Tutee'
        },{
          model: Exercise
        }]
      })
      .catch(next)
      .then(function(pairings) {
        res.render('partials/pairings', {
          class: c,
          pairings: pairings,
          layout: false
        }, function(err, html) {
          if (err) return next(err)
          payload.partial = html
          done()
        })
      })
    } else {
      done()
    }
  })
  .catch(next)
})

module.exports = router
