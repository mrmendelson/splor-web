var Sequelize = require('sequelize')
var sequelize = require('../db')
var Exercise = require('./Exercise')

var User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teacher: {type: Sequelize.BOOLEAN, allowNull: true},
  khanId: {type: Sequelize.TEXT, allowNull: false, unique: true},
  name: {type: Sequelize.STRING, allowNull: false},
  username: {type: Sequelize.STRING, allowNull: false},
  password: {type: Sequelize.STRING, allowNull: true},
  email: {type: Sequelize.STRING, allowNull: false},
  khanToken: {type: Sequelize.STRING, allowNull: true},
  khanSecret: {type: Sequelize.STRING, allowNull: true},
  createdAt: {
    type: Sequelize.DATE
  },
  updatedAt: {
    type: Sequelize.DATE
  }
})

User.hasMany(Exercise, {as: 'Exercises'})

module.exports = User
