module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('Users', 'khanId', {
      type: Sequelize.TEXT,
      allowNull: true,
      unique: true
    }).then(function() {
      return queryInterface.addColumn('Users', 'khanLongId', {
        type: Sequelize.STRING,
        allowNull: true
      })
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('Users', 'khanId', {
      type: Sequelize.TEXT,
      allowNull: false,
      unique: true
    }).then(function() {
      return queryInterface.removeColumn('Users', 'khanLongId')
    })
  }
};
