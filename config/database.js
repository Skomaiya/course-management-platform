const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTest = process.env.NODE_ENV === "test"

const sequelize = new Sequelize(
   isTest ? "course_test_schema" : "course_dev_schema",
  "root",
  "Passme1$",
  {
    host: "localhost",
    port: 3306,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
