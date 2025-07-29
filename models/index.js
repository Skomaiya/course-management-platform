const { sequelize } = require('../config/database');
// import models
const Class = require('./class');
const Student = require('./student');
const Facilitator = require('./facilitator');
const Manager = require('./manager');
const Module = require('./module');
const Mode = require('./mode');
const Cohort = require('./cohort');
const Allocation = require('./allocation');
const User = require('./user');


// Define Associations

// Student → Class
Student.belongsTo(Class, { foreignKey: 'classId' });
Class.hasMany(Student, { foreignKey: 'classId' });

// Student → Cohort
Student.belongsTo(Cohort, { foreignKey: 'cohortId' });
Cohort.hasMany(Student, { foreignKey: 'cohortId' });

// Facilitator → Manager
Facilitator.belongsTo(Manager, { foreignKey: 'managerId' });
Manager.hasMany(Facilitator, { foreignKey: 'managerId' });

// Allocation → Module
Allocation.belongsTo(Module, { foreignKey: 'moduleId' });
Module.hasMany(Allocation, { foreignKey: 'moduleId' });

// Allocation → Class
Allocation.belongsTo(Class, { foreignKey: 'classId' });
Class.hasMany(Allocation, { foreignKey: 'classId' });

// Allocation → Facilitator
Allocation.belongsTo(Facilitator, { foreignKey: 'facilitatorId' });
Facilitator.hasMany(Allocation, { foreignKey: 'facilitatorId' });

// Allocation → Mode
Allocation.belongsTo(Mode, { foreignKey: 'modeId' });
Mode.hasMany(Allocation, { foreignKey: 'modeId' });

// User → Student
User.hasOne(Student, { foreignKey: 'userId' });
Student.belongsTo(User, { foreignKey: 'userId' });

// User → Facilitator
User.hasOne(Facilitator, { foreignKey: 'userId' });
Facilitator.belongsTo(User, { foreignKey: 'userId' });

// User → Manager
User.hasOne(Manager, { foreignKey: 'userId' });
Manager.belongsTo(User, { foreignKey: 'userId' });


// Export All Models
module.exports = {
  sequelize,
  Class,
  Student,
  Facilitator,
  Manager,
  Module,
  Mode,
  Cohort,
  Allocation,
  User,
};
