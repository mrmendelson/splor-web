var passport = require('passport')
var KhanStrategy = require('passport-khan').Strategy
var config = require('../config/khan')
var upsertUser = require('./shared/upsert-user')
var User = require('./models/User')

var jwt = require('jsonwebtoken')
var jwtConfig = require('../config/webtokens')

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  User.findById(id).then(function(user) {
    done(null, user && user.get({plain: true}))
  })
})

passport.use(new KhanStrategy({
    consumerKey: config.key,
    consumerSecret: config.secret,
    callbackURL: config.callbackURL
  },
  function(token, tokenSecret, profile, done) {
    upsertUser(profile._json, token, tokenSecret, function(err, userInfo) {
      if (err) return done(err)
      userInfo.token = jwt.sign(userInfo, jwtConfig.secret)
      done(null, userInfo)
    })
  }
))
