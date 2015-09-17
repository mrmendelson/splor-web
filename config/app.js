require('dotenv').load()

module.exports = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || '4000'
}
