var Promise = require('bluebird')

var models = require('lib/models')
var User = models.User
var Class = models.Class
var Pairing = models.Pairing
var Exercise = models.Exercise

module.exports = function(req, res, next) {
  Promise.all([
    Class.findOne({
      where: {
        id: req.params.id
      },
      include: [{
        model: User,
        as: 'Teacher',
        where: { id: req.user.id }
      }]
    }),
    User.count({
      include: [{
        model: Class,
        as: 'Classes',
        where: {
          id: req.params.id
        }
      }]
    })
  ])
  .spread(function(c, studentCount) {
    return Promise.all([
      Pairing.findAll({
        include: [{
          model: Class,
          where: { id: c.id },
          fields: ['id']
        },{
          model: User,
          as: 'Tutor'
        },{
          model: User,
          as: 'Tutee'
        },{
          model: Exercise
        }]
      }),
      c,
      studentCount
    ])
  })
  .spread(function(pairings, c, studentCount) {
    res.render('class', {
      class: c,
      pairings,
      user: req.user,
      studentCount: studentCount
    })
  })
  .catch(next)
}
