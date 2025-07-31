const { Sequelize } = require('sequelize');

// Database configuration
const DB_HOST = "localhost";
const DB_PORT = 3306;
const DB_USER = "root";
const DB_PASSWORD = "Passme1$";

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
    await setupSequelize.query('CREATE DATABASE IF NOT EXISTS course_test_schema');
    console.log('Test database created/verified');

    // Create development database
    await setupSequelize.query('CREATE DATABASE IF NOT EXISTS course_dev_schema');
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