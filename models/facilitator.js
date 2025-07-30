const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Facilitator = sequelize.define('Facilitator', {
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
