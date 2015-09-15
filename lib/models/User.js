var Sequelize = require('sequelize')
var sequelize = require('../db')

var User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  khanId: {type: Sequelize.TEXT, allowNull: false, unique: true},
  name: {type: Sequelize.STRING, allowNull: false},
  username: {type: Sequelize.STRING, allowNull: false, unique: true},
  password: {type: Sequelize.STRING, allowNull: true},
  email: {type: Sequelize.STRING, allowNull: false},
  khanToken: {type: Sequelize.STRING, allowNull: false, unique: true},
  khanSecret: {type: Sequelize.STRING, allowNull: false, unique: true},
  createdAt: {
    type: Sequelize.DATE
  },
  updatedAt: {
    type: Sequelize.DATE
  }
})

module.exports = User
