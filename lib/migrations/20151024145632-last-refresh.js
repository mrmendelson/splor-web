'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'Users',
      'lastRefresh',
      {
        type: Sequelize.DATE
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Users', 'lastRefresh');
  }
};
