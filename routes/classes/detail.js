var Promise = require('bluebird')

var models = require('lib/models')
var User = models.User
var Class = models.Class
var Pairing = models.Pairing
var Exercise = models.Exercise

module.exports = function(req, res, next) {
  Class.findOne({
    where: {
      id: req.params.id
    },
    include: [{
      model: User,
      as: 'Teacher',
      where: { id: req.user.id }
    }]
  })
  .then(function(c) {
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
      c
    ])
  })
  .spread(function(pairings, c) {
    res.render('class', {
      class: c,
      pairings
    })
  })
  .catch(next)
}
