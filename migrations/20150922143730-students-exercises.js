'use strict';

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.createTable('exercises', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      khan_id:  {type: DataTypes.INTEGER, allowNull: false}, // exercise_model:id
      URL: {type: DataTypes.STRING, allowNull: false}, // exercise_model:ka_url
      name: {type: DataTypes.STRING, allowNull: false}, // exercise_model:pretty_display_name
      kind: {type: DataTypes.STRING, allowNull: false}, // exercise_model:kind
      struggling: {type: DataTypes.BOOLEAN, allowNull: false}, // exercise_states:struggling
      proficient: {type: DataTypes.BOOLEAN, allowNull: false}, // exercise_states:proficient
      practiced: {type: DataTypes.BOOLEAN, allowNull: false}, // exercise_states:practiced
      mastered: {type: DataTypes.BOOLEAN, allowNull: false}, // exercise_states:mastered
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    })
    migration.addColumn('users', 'teacher', {
      type: DataTypes.BOOLEAN,
      allowNull: true
    })
    done()
  },

  down: function (migration, DataTypes, done) {
    migration.dropTable('exercises')
    migration.removeColumn('users', 'teacher')
    done()
  }
};
