var Sequelize = require('sequelize')
var sequelize = require('../db')

var Exercise = sequelize.define('exercise', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  khan_id:  {type: Sequelize.STRING, allowNull: false}, // exercise_model:id
  URL: {type: Sequelize.STRING, allowNull: false}, // exercise_model:ka_url
  name: {type: Sequelize.STRING, allowNull: false}, // exercise_model:pretty_display_name
  kind: {type: Sequelize.STRING, allowNull: false}, // exercise_model:kind
  struggling: {type: Sequelize.BOOLEAN, allowNull: false}, // exercise_states:struggling
  proficient: {type: Sequelize.BOOLEAN, allowNull: false}, // exercise_states:proficient
  practiced: {type: Sequelize.BOOLEAN, allowNull: false}, // exercise_states:practiced
  mastered: {type: Sequelize.BOOLEAN, allowNull: false}, // exercise_states:mastered
  createdAt: {
    type: Sequelize.DATE
  },
  updatedAt: {
    type: Sequelize.DATE
  }
})

module.exports = Exercise
