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
          model: 'Exercise',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'User',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
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
