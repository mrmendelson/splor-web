var db = require('./db').development

var config = {
  host: db.host,
  dialect: db.dialect,
  protocol: db.protocol,
  port: db.port,
  database: db.database,
  storage: db.storage
}

if (db.username) config.username = db.username
if (db.password) config.password = db.password

module.exports = {
  development: config,
  production: {
    use_env_variable: process.env.DATABASE_URL
  }
}
