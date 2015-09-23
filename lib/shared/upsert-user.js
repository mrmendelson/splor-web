var User = require('../models/User')

module.exports = function(profile, token, tokenSecret, done) {
  if (typeof token === 'function') {
    done = token
    token = null
    tokenSecret = null
  }
  // console.log('upserting', profile, token, tokenSecret)
  var userInfo = {
    khanId: profile.kaid,
    name: profile.nickname,
    username: profile.username,
    email: profile.email,
    teacher: profile.teacher
  }
  // don't overwrite these values
  if (token) userInfo.khanToken = token
  if (tokenSecret) userInfo.khanSecret = tokenSecret
  
  User.upsert(userInfo).then(function(created) {
    User.findOne({
      where: {
        khanId: profile.kaid
      }
    }).then(function(user) {
      var userInfo = user.get()
      done(null, userInfo, user)
    }).catch(function(err) {
      done(err)
    })
  }).catch(function(err) {
    done(err)
  })
}
