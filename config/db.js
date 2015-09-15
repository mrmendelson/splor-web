require('dotenv').load()

var config = {
  host: process.env.DB_HOST || 'localhost',
  type: process.env.DB_TYPE || 'mysql', // |'mariadb'|'sqlite'|'postgres'|'mssql',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'splore',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
}

if (config.type === 'sqlite') {
  config.storage = process.env.SQLITE_STORE
  if (!config.storage) {
    throw new Error('You must specify SQLITE_STORE when using the sqlite engine.')
  }
}

module.exports = config
