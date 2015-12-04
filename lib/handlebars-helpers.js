var moment = require('moment')
var User = require('lib/models').User

/**
 * fromNow helper
 *
 * Humanizes a date by displaying how long since the date has passed.
 * Usage:
 * {{fromNow date}}
 * where date is a javascript date. If the date is invalid, this will instead print "Never".
 */
module.exports.fromNow = function(object) {
  if (object) {
    var date = moment(new Date(object))
    if (date.isValid()) return date.fromNow()
  }
  return 'Never'
}

/**
 * Restrict helper
 *
 * Usage:
 * {{#restrict 'ROLENAME'}}
 * <!-- restricted content goes here, only visible to users with role ROLENAME or higher -->
 * {{/restrict}}
 *
 * the role name can be found in the User model file under classMethods.
 */
module.exports.restrict = function(type, options) {
  var user = this.user
  var role = User.roles[type]
  if (typeof role === 'undefined') throw new Error('Invalid role passed to restrict helper.')
  return user && user.role >= role ? options.fn(this) : options.inverse(this)
}

/**
 * Debug helper
 *
 * Usage:
 * {{debug somevalue}} or {{debug}}
 *
 * Use this to troubleshoot values in a hbs template. Put this anywhere you like,
 * then look at the console output to see the current context, and if you have
 * specified a value, it will be pretty printed to the page and the console.
 */
module.exports.debug = function(optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);

  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
    return JSON.stringify({
      value: optionalValue
    }, null, 4)
  }
}
