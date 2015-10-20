var express = require('express')
var router = express.Router()
var Promise = require('bluebird')

var models = require('lib/models')
var User = models.User
var Class = models.Class

router.get('/', function(req, res, next) {
  var teacherId = req.user.id
  Promise.join(
    User.findAll({
      include: [{
        model: User,
        as: 'Teachers',
        where: { id: teacherId }
      }]
    }),
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

module.exports = router
