var express = require('express')
var router = express.Router()
var Promise = require('bluebird')

var models = require('lib/models')
var Pairing = models.Pairing

router.post('/:id/delete', function(req, res, next) {
  Pairing.destroy({
    where: { id: req.params.id }
  })
  .then(function() {
    res.redirect(req.get('Referrer') || '/classes')
  })
  .catch(next)
})

module.exports = router
