var express = require('express')
var router = express.Router()
var Promise = require('bluebird')

var models = require('lib/models')
var User = models.User
var Class = models.Class

router.get('/', function(req, res, next) {
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
})

router.post('/', function(req, res, next) {
  res.json({success: true})
})

module.exports = router
