var express = require('express')
var router = express.Router()
var debug = require('debug')('splor:api:students')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var models = require('../../lib/models')
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
 * @return {array}             : an array of pairings, where each node is an object with a "tutor" and "tutee" key for this exercise
 */
function generatePairings(studentMap, exercise) {
  var mastered = []
  var struggling = []
  // get a map of studentId: { skill: Skill, student: User } object pairings
  var skillMap = Object.keys(studentMap).reduce(function(o, id) {
    var student = studentMap[id]
    var len = student.Exercises.length
    for (var i = 0; i < len; i++) {
      var e = student.Exercises[i]
      if (e.khan_id === exercise.khan_id) {
        o[id] = { skill: e.Skill, stuent: student }
        break
      }
    }
    return o
  }, {})
  // loop through each skill and bucket them to either mastered or struggling
  Object.keys(skillMap).forEach(function(id) {
    var info = skillMap[id]
    var skill = info.skill
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

function refreshPairings(exerciseInfo, c, callback) {
  var exercise = exerciseInfo.exercise
  var studentMap = exerciseInfo.studentMap
  exercise.setPairings([])
  .then(function() {
    var pairings = generatePairings(studentMap, exercise)
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
router.get('/refresh/:classId', function(req, res, next) {
  Class.findOne({
    where: {
      id: req.params.classId
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
      where: { id: req.user.id }
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

    // get pairings for each of our exercises we have students that are struggling/mastered
    async.reduce(exercises, 0, function(memo, e, done) {
      refreshPairings(e, c, function(err, pairings) {
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

    return

    // Get a map of all the exercises that we have students in the class working on (this uniques exercises so we will do less loops)
    var exMap = c.Students.reduce(function(o, student) {
      student.Exercises.forEach(function(e) { o[e.khan_id] = e })
      return o
    }, {})

    // Then fetch these exercises from the db
    return Exercise.findAll({
      where: {
        khan_id: { $in: Object.keys(exMap) }
      },
      include: [{
        model: User
      }]
    })
    .then(function(exercises) {

    })
  })
  .catch(next)
})

module.exports = router
