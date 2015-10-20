var debug = require('debug')('splor:authorized-request')
var khanConfig = require('../../config/khan')
var khanAPI = require('khan')(khanConfig.key, khanConfig.secret)
var async = require('async')
var models = require('../models')
var Promise = require('bluebird')
var url = require('url')
var User = models.User

var request = {}

request.withId = function(id, uri, next) {
  User.findById(id)
    .catch(next)
    .then(function(user) {
      if (!user) return debug('user not found.')
      debug('refreshing users as user ' + JSON.stringify(user))
      refresh.withUser(user, uri, next)
    })
}

request.withUser = function(teacher, uri, next) {
  var khan = khanAPI(teacher.khanSecret, teacher.khanToken)
  var parsed = url.parse(uri, true, true)
  khan.request(parsed.pathname, parsed.query)
  .then(function(response) {
    next(null, response)
  })
  .catch(function(err) {
    try {
      next(new Error(err.response.error.text))
    } catch (e) {
      next(err)
    }
  })
}

module.exports = refresh
