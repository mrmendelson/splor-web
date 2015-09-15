var jwt = require('jsonwebtoken')
var jwtConfig = require('../../config/webtokens')

function ensureAuthenticated(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, jwtConfig.secret, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' })
      } else {
        req.user = decoded
        next()
      }
    })
  } else if (req.isAuthenticated()) {
    next()
  } else {
    return res.status(403).send({
        success: false,
        message: 'Missing or invalid token or session.'
    })
  }
}

module.exports = ensureAuthenticated
