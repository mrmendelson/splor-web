var express = require('express')
var router = express.Router()
var debug = require('debug')('splor:api:students')
var emailConfig = require('../../config/email')
var OVERRIDE_EMAIL = emailConfig.overrideEmail

var email = require('lib/email')
var models = require('lib/models')
var Promise = require('bluebird')

var User = models.User
var Exercise = models.Exercise
var Pairing = models.Pairing
var Class = models.Class

router.post('/:classId', function(req, res, next) {
  Pairing.findAll({
    include: [{
      model: Class,
      where: { id: req.params.classId },
      include: [{
        model: User,
        as: 'Teacher'
      }]
    }, {
      model: User,
      as: 'Tutor'
    }, {
      model: User,
      as: 'Tutee'
    }, {
      model: Exercise
    }]
  })
  .map(function(pairing) {
    var opts = {
      layout: 'email',
      exercise: pairing.Exercise,
      tutor: pairing.Tutor,
      teacher: pairing.Class.Teacher,
      tutee: pairing.Tutee
    }
    return new Promise(function(resolve, reject) {
      res.render('email/splorTutor', opts, function(err, tutorHtml) {
        if (err) return reject(err)
        res.render('email/splorTutee', opts, function(err, tuteeHtml) {
          if (err) return reject(err)
          resolve({
            pairing: pairing,
            tutor: tutorHtml,
            tutee: tuteeHtml
          })
        })
      })
    })
  })
  .map(function(info) {
    var tutor = info.pairing.Tutor
    var tutee = info.pairing.Tutee
    var teacher = info.pairing.Class.Teacher
    var baseOpts = {
       from: teacher.name + '<' + teacher.email + '>', // sender address
       subject: '💡Your Splor pairing for the day💡', // Subject line
    }
    var tutorOpts = Object.assign({}, baseOpts, {
      to: OVERRIDE_EMAIL || tutor.email,
      html: info.tutor
    })
    var tuteeOpts = Object.assign({}, baseOpts, {
      to: OVERRIDE_EMAIL || tutee.email,
      html: info.tutee
    })
    return Promise.all([
      email.sendMail(tutorOpts),
      email.sendMail(tuteeOpts)
    ])
  })
  .then(function(emails) {
    // flatten the emails
    emails = emails.reduce(function(a, b) {
      return a.concat(b);
    }, []);
    res.json({ message: 'successfully sent ' + emails.length + ' emails.' })
  })
  .catch(next)
})

module.exports = router
