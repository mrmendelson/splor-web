require('dotenv').load()

if (!process.env.KHAN_CONSUMER_KEY) throw new Error('Missing required environment variable KHAN_CONSUMER_KEY')
if (!process.env.KHAN_CONSUMER_SECRET) throw new Error('Missing required environment variable KHAN_CONSUMER_SECRET')

module.exports = {
  key: process.env.KHAN_CONSUMER_KEY,
  secret: process.env.KHAN_CONSUMER_SECRET,
  callbackURL: '/auth/khan/callback'
}
