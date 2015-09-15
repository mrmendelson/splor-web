require('dotenv').load()

module.exports = {
  host: process.env.HOST || '127.0.0.1',
  port: process.env.PORT || '4000'
}
