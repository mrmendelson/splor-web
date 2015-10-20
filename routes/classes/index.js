var express = require('express')
var router = express.Router()
var Promise = require('bluebird')

var models = require('lib/models')
var User = models.User
var Class = models.Class

function renderClasses(req, res, next) {
  var teacherId = req.user.id
  Class.findAll({
    include: [{
      model: User,
      as: 'Teacher',
      where: { id: teacherId }
    }]
  })
  .catch(next)
  .then(function(classes) {
    res.render('classes', {
      title: 'Classes',
      user: req.user,
      classes: classes
    })
  })
}

router.get('/', renderClasses)
router.post('/', function(req, res, next) {
  Class.create(req.body)
  .then(function(saved) {
    return saved.setTeacher(req.user)
  })
  .catch(next)
  .then(renderClasses.bind(this, req, res, next))
})

module.exports = router
