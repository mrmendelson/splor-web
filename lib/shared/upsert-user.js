var models = require('lib/models')
var Promise = require('bluebird')
var User = models.User
var KhanCoach = models.KhanCoach
var KhanAuthEmail = models.KhanAuthEmail

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

  // normalize and unique the auth_emails field
  var authEmails = Object.keys(profile.auth_emails.reduce(function(o, email) {
    o[email.replace(/^[^:]*:/, '')] = true
    return o
  }, {})).map(function(e) {
    return KhanAuthEmail.build({ email: e })
  })
  var coaches = profile.coaches.map(function(c) {
    return KhanCoach.build({ identifier: c })
  })

  function next(err, user) {
    if (err) return done(err)
    Promise.join(
      KhanCoach.destroy({ where: { UserId: user.id } }),
      KhanAuthEmail.destroy({ where: { UserId: user.id } })
    ).then(function() {
      return Promise.join(
        Promise.all(authEmails.map(e => e.save())),
        Promise.all(coaches.map(c => c.save()))
      ).spread(function(authEmails, coaches) {
        user.setKhanAuthEmails(authEmails),
        user.setKhanCoaches(coaches)
      })
    }).then(function() {
      done(err, user.get(), user)
    })
  }

  var findOpts = {
    where: {
      khanId: profile.kaid
    },
    include: [{
      model: User,
      as: 'Teachers'
    }]
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
