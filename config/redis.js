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
  var port = process.env.REDIS_PORT
  if (isNaN(parseInt(port, 10))) {
    port = process.env.REDIS_PORT_6379_TCP_PORT || 6379
  }
  config = {
    host: process.env.REDIS_HOST || process.env.REDIS_PORT_6379_TCP_ADDR || 'localhost',
    port: port
  }
}

module.exports = config
