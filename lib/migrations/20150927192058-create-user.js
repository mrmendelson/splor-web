'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      teacher: {type: Sequelize.BOOLEAN, allowNull: true},
      khanId: {type: Sequelize.TEXT, allowNull: false, unique: true},
      name: {type: Sequelize.STRING, allowNull: false},
      username: {type: Sequelize.STRING, allowNull: false},
      password: {type: Sequelize.STRING, allowNull: true},
      email: {type: Sequelize.STRING, allowNull: false},
      khanToken: {type: Sequelize.STRING, allowNull: true},
      khanSecret: {type: Sequelize.STRING, allowNull: true},
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
    return queryInterface.dropTable('Users');
  }
};
