require('dotenv').load()

var config

if (process.env.REDIS_URL) {
  config = require('redis-url').parse(process.env.REDIS_URL)
} else {
  config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
}

module.exports = config
