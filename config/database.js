const { Sequelize } = require('sequelize');
require('dotenv').config();


const sequelize = new Sequelize(
  "course_schema",
  "root",
  "Passme1$",
  {
    host: "localhost",
    port: 3306,
    dialect: 'mysql',
    logging: true,
  }
);


module.exports = sequelize;
