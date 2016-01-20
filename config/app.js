require('dotenv').load()

module.exports = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || '4000'
}
