var express = require('express')
var router = express.Router()
var debug = require('debug')('splor:api')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var restrict = require('../restrict')

router.use('/students', restrict(restrict.roles.SUPERUSER), require('./students'))
router.use('/pairings', require('./pairings'))
router.use('/splor', require('./splor'))

router.get('/khan/*', restrict(restrict.roles.SUPERUSER), function(req, res, next) {
  var user = req.user
  var params = req.query
  var khan = khanAPI(user.khanSecret, user.khanToken)
  var path = req.originalUrl.replace(/^\/api\/khan/i, '')
  var url = 'https://www.khanacademy.org/api' + path
  khan.request(url, params)
    .then(res.json.bind(res))
    .catch(next)
})

module.exports = router
