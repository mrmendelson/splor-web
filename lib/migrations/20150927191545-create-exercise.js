'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Exercises', {
      khan_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      URL: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      kind: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Exercises', {cascade: true});
  }
};
