var Sequelize = require('sequelize')
var config = require('../../config/db')

var sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.type,
  pool: config.pool,
  storage: config.storage
})

module.exports = sequelize
