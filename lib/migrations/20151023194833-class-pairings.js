'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'Pairings',
      'ClassId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Classes',
          key: 'id'
        }
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Pairings', 'ClassId');
  }
};
