require('dotenv').load()

var config

if (process.env.REDIS_URL) {
  var parsed = require('redis-url').parse(process.env.REDIS_URL)
  var dbNum = parseInt(parsed.database, 10)
  config = {
    host: parsed.hostname,
    port: parsed.port,
    pass: parsed.password,
    auth_pass: parsed.password,
    db: dbNum
  }
} else {
  config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
}

module.exports = config
