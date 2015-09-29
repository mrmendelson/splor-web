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
      },
      ExerciseKhanId: {
        type: Sequelize.STRING,
        references: {
          model: 'Exercises',
          key: 'khan_id'
        }
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
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
    return queryInterface.dropTable('Skills');
  }
};
