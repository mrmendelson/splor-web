var Skill = require('../models/Skill')
var User = require('../models/User')
var Exercise = require('../models/Exercise')

User.belongsToMany(Exercise, {through: Skill})
Exercise.belongsToMany(User, {through: Skill})

User.belongsToMany(User, {as: 'Students', through: 'Teacher_Students', foreignKey: 'TeacherId'})
User.belongsToMany(User, {as: 'Teachers', through: 'Teacher_Students', foreignKey: 'StudentId'})

module.exports = {
  User: User,
  Skill: Skill,
  Exercise: Exercise
}
