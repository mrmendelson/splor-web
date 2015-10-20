'use strict';
module.exports = function(sequelize, DataTypes) {
  var Class = sequelize.define('Class', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        var User = models.User
        var Class = models.Class
        // var Exercise = models.Exercise

        Class.belongsTo(User, {as: 'Teacher'})

        User.belongsToMany(Class, {as: 'Classes', through: 'Student_Classes', foreignKey: 'StudentId'})
        Class.belongsToMany(User, {as: 'Students', through: 'Student_Classes', foreignKey: 'ClassId'})
      }
    }
  });
  return Class;
};
