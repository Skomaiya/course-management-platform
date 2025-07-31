const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration from environment variables with fallbacks
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "Passme1$";
const TEST_DB_NAME = process.env.TEST_DB_NAME || "course_test_schema";
const DEV_DB_NAME = process.env.DEV_DB_NAME || "course_dev_schema";

// Setup database function - creates databases if they don't exist
async function setupDatabase() {
  try {
    // Create a connection to MySQL server
    const setupSequelize = new Sequelize(
      'mysql',
      DB_USER,
      DB_PASSWORD,
      {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'mysql',
        logging: false,
      }
    );

    // Test connection
    await setupSequelize.authenticate();
    console.log('Connected to MySQL server');

    // Create test database
    await setupSequelize.query(`CREATE DATABASE IF NOT EXISTS ${TEST_DB_NAME}`);
    console.log('Test database created/verified');

    // Create development database
    await setupSequelize.query(`CREATE DATABASE IF NOT EXISTS ${DEV_DB_NAME}`);
    console.log('Development database created/verified');

    await setupSequelize.close();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error.message);
    throw error;
  }
}

// Test connection function
async function testConnection() {
  try {
    const sequelize = require('./config/database');
    await sequelize.authenticate();
    console.log('Database connection test successful');
    await sequelize.close();
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    throw error;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => testConnection())
    .then(() => {
      console.log('All database operations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase, testConnection }; 