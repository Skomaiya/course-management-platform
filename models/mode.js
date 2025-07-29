const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mode = sequelize.define('Mode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'modes',
  timestamps: false,
});

module.exports = Mode;
