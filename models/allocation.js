const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Allocation = sequelize.define('Allocation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  moduleId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  facilitatorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  trimester: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  modeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  year: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'allocations',
  timestamps: true,
});

module.exports = Allocation;
