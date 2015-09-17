var Sequelize = require('sequelize')
var env = process.env.NODE_ENV || 'development'
var config = require('../../config/db')[env]

var sequelize

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable])
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config)
}

module.exports = sequelize
