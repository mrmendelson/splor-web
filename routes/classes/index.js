var express = require('express')
var router = express.Router()
var Promise = require('bluebird')

var renderClasses = require('./list')

router.get('/', renderClasses)
router.post('/', function(req, res, next) {
  Class.create(req.body)
  .then(function(saved) {
    return saved.setTeacher(req.user)
  })
  .catch(next)
  .then(renderClasses.bind(this, req, res, next))
})

router.get('/:id', require('./detail'))

module.exports = router
