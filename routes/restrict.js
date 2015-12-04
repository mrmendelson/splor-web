var User = require('lib/models').User

/**
 * Restrict middleware
 * @param  {Integer} role - a role level that a user must be above to access this area.
 * @return {function}      an express middleware function.
 */
module.exports = function(role) {
  return function(req, res, next) {
    if (!req.user) return next(new Error('Not logged in.'))
    if (req.user.role < role) return next(new Error('Permission denied.'))
    next()
  }
}

module.exports.roles = User.roles
