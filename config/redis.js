require('dotenv').load()

var config

if (process.env.REDIS_URL) {
  var parsed = require('redis-url').parse(process.env.REDIS_URL)
  config = {
    host: parsed.host,
    port: parsed.port,
    pass: parsed.password,
    db: parsed.database
  }
} else {
  config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
}

module.exports = config
