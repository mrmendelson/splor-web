var Promise = require('bluebird')

var models = require('lib/models')
var User = models.User
var Class = models.Class

module.exports = function renderClasses(req, res, next) {
  var teacherId = req.user.id
  Class.findAll({
    include: [{
      model: User,
      as: 'Teacher',
      where: { id: teacherId }
    }, {
      model: User,
      as: 'Students'
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
