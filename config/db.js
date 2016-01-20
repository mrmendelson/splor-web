require('dotenv').load()

var debug = require('debug')('SQL')

var config = {
  host: process.env.DB_HOST || process.env.POSTGRES_PORT_5432_TCP_ADDR || 'localhost',
  port: process.env.DB_PORT || process.env.POSTGRES_PORT_5432_TCP_PORT || 5432,
  dialect: process.env.DB_TYPE || 'postgres', // |'mariadb'|'sqlite'|'mysql'|'mssql',
  protocol: process.env.DB_TYPE || 'postgres',
  database: process.env.DB_NAME || 'splor',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  username: process.env.DB_USER || 'splor',
  password: process.env.DB_PASS || '',
  logging: debug
}

if (config.dialect === 'sqlite') {
  config.storage = process.env.SQLITE_STORE
  if (!config.storage) {
    throw new Error('You must specify SQLITE_STORE when using the sqlite engine.')
  }
}

module.exports = {
  development: config,
  production: {
    use_env_variable: 'DATABASE_URL'
  }
}
