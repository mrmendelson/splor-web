require('dotenv').load()

if (!process.env.GMAIL_USER) throw new Error('Missing required environment variable GMAIL_USER')
if (!process.env.GMAIL_PASSWORD) throw new Error('Missing required environment variable GMAIL_PASSWORD')

module.exports = {
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    },
    overrideEmail: process.env.OVERRIDE_EMAIL
}
