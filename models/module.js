const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Module = sequelize.define('Module', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  half: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['H1', 'H2', 'FT']],
    },
  },
}, {
  tableName: 'modules',
  timestamps: true,
});

module.exports = Module;
