require('dotenv').load()

module.exports = {
  auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
  },
  overrideEmail: process.env.OVERRIDE_EMAIL
}
