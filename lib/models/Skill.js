var Sequelize = require('sequelize')
var sequelize = require('../db')

var Skill = sequelize.define('skill', {
  struggling: {type: Sequelize.BOOLEAN, allowNull: false}, // exercise_states:struggling
  proficient: {type: Sequelize.BOOLEAN, allowNull: false}, // exercise_states:proficient
  practiced: {type: Sequelize.BOOLEAN, allowNull: false}, // exercise_states:practiced
  mastered: {type: Sequelize.BOOLEAN, allowNull: false}, // exercise_states:mastered
})

module.exports = Skill
