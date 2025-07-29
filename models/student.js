// const { DataTypes } = require('sequelize');
// const { sequelize } = require('../config/database');

// const Student = sequelize.define('Student', {
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//     validate: { isEmail: true },
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   classId: {
//     type: DataTypes.UUID,
//     allowNull: false,
//   },
//   cohortId: {
//     type: DataTypes.UUID,
//     allowNull: false,
//   },
// }, {
//   tableName: 'students',
//   timestamps: true,
// });

// module.exports = Student;
