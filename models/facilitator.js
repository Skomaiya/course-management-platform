const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Facilitator = sequelize.define('Facilitator', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  qualification: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'facilitators',
  timestamps: true,
});

module.exports = Facilitator;
