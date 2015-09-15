var passport = require('passport')
var KhanStrategy = require('passport-khan').Strategy
var config = require('../config/khan')
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
    console.log(profile._json)
    User.findOrCreate({
      where: {
        khanId: profile.id
      },
      defaults: {
        name: profile.displayName,
        username: profile.username,
        khanRaw: profile._raw,
        email: profile._json.email,
        khanToken: token,
        khanSecret: tokenSecret
      }
    }).spread(function(user, created) {
      var userInfo = user.get({
        plain: true
      })
      userInfo.token = jwt.sign(userInfo, jwtConfig.secret)
      console.log(userInfo)
      console.log(created)
      done(null, userInfo)
    })
  }
))
