var Sequelize = require('sequelize')
var sequelize = require('../db')

var Exercise = sequelize.define('exercise', {
  khan_id:  {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  }, // exercise_model:id
  URL: {type: Sequelize.STRING, allowNull: false}, // exercise_model:ka_url
  name: {type: Sequelize.STRING, allowNull: false}, // exercise_model:pretty_display_name
  kind: {type: Sequelize.STRING, allowNull: false}, // exercise_model:kind
  createdAt: {
    type: Sequelize.DATE
  },
  updatedAt: {
    type: Sequelize.DATE
  }
})

module.exports = Exercise
