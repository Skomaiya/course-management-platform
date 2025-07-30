const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  allocationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  week: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  attendance: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  formativeOneGrading: {
    type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
    defaultValue: 'Not Started',
  },
  formativeTwoGrading: {
    type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
    defaultValue: 'Not Started',
  },
  summativeGrading: {
    type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
    defaultValue: 'Not Started',
  },
  courseModeration: {
    type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
    defaultValue: 'Not Started',
  },
  intranetSync: {
    type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
    defaultValue: 'Not Started',
  },
  gradeBookStatus: {
    type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
    defaultValue: 'Not Started',
  },
}, {
  
  tableName: 'activity_logs',
  timestamps: true
});

module.exports = ActivityLog;
