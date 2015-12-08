'use strict';
module.exports = function(sequelize, DataTypes) {
  var KhanAuthEmail = sequelize.define('KhanAuthEmail', {
    email: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        var User = models.User;
        var KhanAuthEmail = models.KhanAuthEmail;
        User.hasMany(KhanAuthEmail, { as: 'KhanAuthEmails' });
        KhanAuthEmail.belongsTo(User);
      }
    }
  });
  return KhanAuthEmail;
};
