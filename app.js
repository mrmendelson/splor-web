var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var exphbs = require('express-handlebars')
var handlebarsHelpers = require('lib/handlebars-helpers')

// Set up passport
var passport = require('passport')
require('./lib/passport')
var ensureAuthenticated = require('./lib/middleware/ensureAuthenticated')

var routes = require('./routes/index')
var auth = require('./routes/auth')
var api = require('./routes/api')

var app = express()

var env = process.env.NODE_ENV || 'development'
app.locals.ENV = env
app.locals.ENV_DEVELOPMENT = env == 'development'

// view engine setup

app.engine('hbs', exphbs({
  extname: '.hbs',
  defaultLayout: 'main',
  partialsDir: ['views/partials/'],
  helpers: handlebarsHelpers
}))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// sessions
var session = require('express-session')
var RedisStore = require('connect-redis')(session)
var sessionConfig = require('./config/sessions')
var redisConfig = require('./config/redis')

var redisStore = new RedisStore(redisConfig)
redisStore.client.on('error', (err) => {
  process.stderr.write('Error connecting to redis: ' + err.message + '\n')
})

app.use(session({
    key: sessionConfig.key,
    secret: sessionConfig.secret,
    store: redisStore,
    resave: true,
    saveUninitialized: true
}))

// app.use(favicon(__dirname + '/public/img/favicon.ico'))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/js', express.static(path.join(__dirname, 'dist')))

app.use('/api', ensureAuthenticated, api)
// API Error Handler
app.use('/api', function(err, req, res, next) {
  res.json({ error: err.message, stack: err.stack })
})
app.use('/', auth)
app.use('/', routes)

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
  Error.stackTraceLimit = Infinity
  require('bluebird').longStackTraces()

  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      user: req.user,
      message: err.message,
      text: err.response && err.response.text,
      error: err,
      title: 'error'
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    user: req.user,
    message: err.message,
    error: {},
    title: 'error'
  })
})


module.exports = app
