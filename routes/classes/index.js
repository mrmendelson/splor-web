var express = require('express')
var router = express.Router()
var Promise = require('bluebird')
var models = require('lib/models')
var Class = models.Class

router.get('/', require('./list'))
router.post('/', function(req, res, next) {
  Class.create(req.body)
  .then(function(saved) {
    return saved.setTeacher(req.user)
  })
  .catch(next)
  .then(function() {
    res.redirect('/classes')
  })
})

router.get('/:id', require('./detail'))

router.post('/:id/delete', function(req, res, next) {
  Class.destroy({ where: { id: req.params.id } })
  .catch(next)
  .then(function() {
    res.redirect('/classes')
  })
})

module.exports = router
