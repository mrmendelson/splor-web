'use strict';
module.exports = function(sequelize, DataTypes) {
  var Pairing = sequelize.define('Pairing', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    }
  }, {
    classMethods: {
      associate: function(models) {
        var User = models.User
        var Exercise = models.Exercise
        var Pairing = models.Pairing
        var Class = models.Class

        Pairing.belongsTo(User, {as: 'Tutor'})
        Pairing.belongsTo(User, {as: 'Tutee'})

        Pairing.belongsTo(Exercise)
        Exercise.belongsToMany(Pairing, {through: 'Exercise_Pairings'})
        Pairing.belongsTo(Class)
      }
    }
  });
  return Pairing;
};
