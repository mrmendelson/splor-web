require('dotenv').load()

var config = {
  secret: process.env.TOKEN_SECRET
}

if (!config.secret) {
  throw new Error('You must specify a TOKEN_SECRET phrase.')
}

module.exports = config
