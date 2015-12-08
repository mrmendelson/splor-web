'use strict';
module.exports = function(sequelize, DataTypes) {
  var KhanCoach = sequelize.define('KhanCoach', {
    identifier: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        var User = models.User;
        var KhanCoach = models.KhanCoach;
        User.hasMany(KhanCoach, { as: 'KhanCoaches' });
        KhanCoach.belongsTo(User);
      }
    }
  });
  return KhanCoach;
};
