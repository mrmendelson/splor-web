'use strict';
module.exports = function(sequelize, DataTypes) {
  var Exercise = sequelize.define('Exercise', {
    khan_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    URL: DataTypes.STRING,
    name: DataTypes.STRING,
    kind: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.Exercise.belongsToMany(models.User, {through: models.Skill})
      }
    }
  });
  return Exercise;
};
