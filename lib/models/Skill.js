'use strict';
module.exports = function(sequelize, DataTypes) {
  var Skill = sequelize.define('Skill', {
    struggling: DataTypes.BOOLEAN,
    proficient: DataTypes.BOOLEAN,
    practiced: DataTypes.BOOLEAN,
    mastered: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Skill;
};