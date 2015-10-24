var Promise = require('bluebird')

var models = require('lib/models')
var User = models.User
var Class = models.Class

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
    res.render('class', {
      class: c
    })
  })
  .catch(next)
}
