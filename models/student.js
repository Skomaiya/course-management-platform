const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  cohortId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'cohorts',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'students',
  timestamps: true,
});

module.exports = Student;
