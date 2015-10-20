var express = require('express')
var router = express.Router()
var Promise = require('bluebird')

var models = require('lib/models')
var User = models.User
var Class = models.Class

function getStudents(teacherId) {
  return User.findAll({
    include: [{
      model: User,
      as: 'Teachers',
      where: { id: teacherId }
    }, {
      model: Class,
      as: 'Classes'
    }]
  })
}

router.get('/', function(req, res, next) {
  var teacherId = req.user.id
  Promise.join(
    getStudents(teacherId),
    Class.findAll({
      include: [{
        model: User,
        as: 'Teacher',
        where: { id: teacherId }
      }]
    })
  )
  .catch(next)
  .spread(function(students, classes) {
    res.render('students', {
      title: 'Students',
      user: req.user,
      students: students,
      classes: classes
    })
  })
})

router.post('/bulk', function(req, res, next) {
  Promise.join(
    Class.findById(req.body.class),
    User.findAll({
      where: {
        id: { $in: req.body.students }
      }
    })
  ).spread(function(aClass, users) {
    if (req.body.action === 'add') {
      return aClass.addStudents(users)
    } else {
      return aClass.removeStudents(users)
    }
  })
  .then(function() {
    return getStudents(req.user.id)
  })
  .catch(next)
  .then(function(students) {
    res.render('partials/students', {
      students: students,
      layout: false
    })
  })
})

module.exports = router
