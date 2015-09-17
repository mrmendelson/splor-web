module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      khanId: {type: DataTypes.STRING, allowNull: false, unique: true},
      name: {type: DataTypes.STRING, allowNull: false},
      username: {type: DataTypes.STRING, allowNull: false, unique: true},
      password: {type: DataTypes.STRING, allowNull: true},
      email: {type: DataTypes.STRING, allowNull: false},
      khanToken: {type: DataTypes.STRING, allowNull: false, unique: true},
      khanSecret: {type: DataTypes.STRING, allowNull: false, unique: true},
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    })
    done()
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable('users')
    done()
  }
}
