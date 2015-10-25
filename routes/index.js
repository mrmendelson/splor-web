var express = require('express')
var router = express.Router()
var ensureAuthenticated = require('../lib/middleware/ensureAuthenticated')

router.use('/', require('./dashboard'))
router.use('/classes', ensureAuthenticated, require('./classes'))
router.use('/students', ensureAuthenticated, require('./students'))
router.use('/pairings', ensureAuthenticated, require('./pairings'))

module.exports = router
