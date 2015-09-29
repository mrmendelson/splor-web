'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    teacher: {type: DataTypes.BOOLEAN, allowNull: true},
    khanId: {type: DataTypes.TEXT, allowNull: false, unique: true},
    name: {type: DataTypes.STRING, allowNull: false},
    username: {type: DataTypes.STRING, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: true},
    email: {type: DataTypes.STRING, allowNull: false},
    khanToken: {type: DataTypes.STRING, allowNull: true},
    khanSecret: {type: DataTypes.STRING, allowNull: true},
    avatar: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        var User = models.User
        var Skill = models.Skill
        var Exercise = models.Exercise

        User.belongsToMany(Exercise, {through: Skill})
        Exercise.belongsToMany(User, {through: Skill})

        User.belongsToMany(User, {as: 'Students', through: 'Teacher_Students', foreignKey: 'TeacherId'})
        User.belongsToMany(User, {as: 'Teachers', through: 'Teacher_Students', foreignKey: 'StudentId'})
      }
    }
  });
  return User;
};
