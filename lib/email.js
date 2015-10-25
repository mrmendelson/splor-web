var nodemailer = require('nodemailer')
var emailConfig = require('../config/email')
var Promise = require('bluebird')

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(emailConfig)

module.exports.transporter = transporter

/**
 * Example options:
{
 from: 'Fred Foo ✔ <foo@blurdybloop.com>', // sender address
 to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
 subject: 'Hello ✔', // Subject line
 text: 'Hello world ✔', // plaintext body
 html: '<b>Hello world ✔</b>' // html body
}
 */
module.exports.sendMail = function(options) {
  return new Promise(function(resolve, reject) {
    transporter.sendMail(options, function(err, info) {
      if (err) return reject(err)
      resolve(info)
    })
  })
}
