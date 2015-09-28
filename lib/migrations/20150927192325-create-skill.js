'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Skills', {
      struggling: {
        type: Sequelize.BOOLEAN
      },
      proficient: {
        type: Sequelize.BOOLEAN
      },
      practiced: {
        type: Sequelize.BOOLEAN
      },
      mastered: {
        type: Sequelize.BOOLEAN
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Skills');
  }
};
