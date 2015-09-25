var express = require('express')
var router = express.Router()
var debug = require('debug')('splor:api')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)

router.use('/students', require('./students'))
router.use('/pairings', require('./pairings'))

router.get('/khan/*', function(req, res, next) {
  var user = req.user
  var params = req.query
  var khan = khanAPI(user.khanSecret, user.khanToken)
  khan.request(req.originalUrl.replace(/^\/api\/khan/i, ''), params)
    .then(res.json.bind(res))
    .catch(next)
})

module.exports = router
