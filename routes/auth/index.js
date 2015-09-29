var express = require('express')
var router = express.Router()
var passport = require('passport')

var jwt = require('jsonwebtoken')
var jwtConfig = require('../../config/webtokens')

function generateToken(user, opts) {
  return jwt.sign(user, jwtConfig.secret, opts)
}

router.get('/login', function(req, res){
  res.render('auth/login', { user: req.user })
})

// Authenticate is not supported yet.
// router.post('/authenticate', function(req, res) {
//   if (!req.body.email || !req.body.password) return res.json(406, {error: 'must pass email and password'})
//   res.send(406, {error: 'not implemented'})
// })

// GET /auth/khan
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Khan Academy authentication will involve redirecting
//   the user to khanacademy.org.  After authorization, Khan Academy will redirect the user
//   back to this application at /auth/khan/callback
router.get('/auth/khan',
  passport.authenticate('khan'),
  function(req, res){
    // The request will be redirected to Khan Academy for authentication, so this
    // function will not be called.
  })

// GET /auth/khan/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/khan/callback',
  passport.authenticate('khan', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect('/')
  })

router.get('/logout', function(req, res){
  req.logout()
  res.redirect('/')
})

module.exports = router
