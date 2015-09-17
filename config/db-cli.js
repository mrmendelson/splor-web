var db = require('./db')

// delete unsupported keys
delete db.development.logging

module.exports = db
