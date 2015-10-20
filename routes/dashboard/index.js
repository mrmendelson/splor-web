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
  // TODO: need to find where teacher is req.user instead.
  Promise.join(
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
    Class.findAll({
      include: [{
        model: User,
        as: 'Teacher',
        where: { id: req.user.id }
      }]
    })
  )
  .catch(next)
  .spread(function(ps, us, cs) {
    if (ps.length) pairings = ps
    if (us.length) students = us
    if (cs.length) classes = cs
    render()
  })
})

module.exports = router
