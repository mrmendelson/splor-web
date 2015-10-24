var express = require('express')
var router = express.Router()
var Promise = require('bluebird')

var models = require('lib/models')
var User = models.User
var Class = models.Class
var Pairing = models.Pairing
var Exercise = models.Exercise

router.get('/', function(req, res, next) {
  var students, pairings, classes
  var render = function() {
    res.render('index', {
      title: 'Splor',
      user: req.user,
      students: students,
      pairings: pairings,
      classes: classes
    })
  }
  if (!req.user) return render()
  Class.findAll({
    include: [{
      model: User,
      as: 'Teacher',
      where: { id: req.user.id }
    }]
  }).then(function(classes) {
    if (classes.length === 1) {
      return res.redirect('/classes/' + classes[0].id)
    }
    return Promise.all([
      Pairing.findAll({
        include: [{
          model: User,
          as: 'Tutor'
        }, {
          model: User,
          as: 'Tutee'
        }, {
          model: Exercise,
          as: 'Exercise'
        }]
      }),
      User.findAll({
        include: [{
          model: User,
          as: 'Teachers',
          where: { id: req.user.id }
        }]
      }),
      classes
    ])
  })
  .catch(next)
  .spread(function(ps, us, cs) {
    if (ps.length) pairings = ps
    if (us.length) students = us
    if (cs.length) classes = cs
    render()
  })
})

module.exports = router
