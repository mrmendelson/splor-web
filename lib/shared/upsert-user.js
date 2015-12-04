var User = require('../models').User

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
    teacher: profile.teacher,
    avatar: profile.avatar_url,
    khanLongId: profile.user_id
  }

  // don't overwrite these values
  if (token) userInfo.khanToken = token
  if (tokenSecret) userInfo.khanSecret = tokenSecret

  // TODO: upsert doesn't appear to respect the kaid, so we'll do a query then an insert/update

  function next(err, user) {
    if (err) return done(err)
    done(err, user.get(), user)
  }

  var findOpts = {
    where: {
      khanId: profile.kaid
    }
  }

  User.findOne(findOpts).then(function(user) {
    if (!user) {
      User.create(userInfo).then(function(user) {
        if (!user) return
        next(null, user)
      }).catch(next)
    } else {
      User.update(userInfo, findOpts).then(function(info) {
        if(!info) return
        User.findOne(findOpts).then(next.bind(null, null)).catch(next)
      }).catch(next)
    }
  }).catch(done)
}
