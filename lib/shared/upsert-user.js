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
    teacher: profile.teacher
  }
  // don't overwrite these values
  if (token) userInfo.khanToken = token
  if (tokenSecret) userInfo.khanSecret = tokenSecret

  // TODO: upsert doesn't appear to respect the kaid, so we'll do a query then an insert/update

  function next(err, user) {
    done(err, user.get(), user)
  }

  User.findOne({
    where: {
      khanId: profile.kaid
    }
  }).then(function(user) {
    if (!user) {
      User.create(userInfo).then(function(user) {
        if (!user) return
        next(null, user)
      }).catch(next)
    } else {
      User.update(userInfo, {
        where: {
          khanId: profile.kaid
        },
        returning: true
      }).then(function(info) {
        if(!info) return
        next(null, info[1][0])
      }).catch(next)
    }
  }).catch(done)
}
