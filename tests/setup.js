const sequelize = require('../config/database');

// Global setup for Jest
beforeAll(async () => {
  try {
    // Ensure database connection
    await sequelize.authenticate();
    console.log('Database connection established for tests');
    
    // Sync all models with force to ensure clean state
    await sequelize.sync({ force: true });
    console.log('Database tables synced for tests');
  } catch (error) {
    console.error('Test setup failed:', error.message);
    throw error;
  }
});

// Global teardown for Jest
afterAll(async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed after tests');
  } catch (error) {
    console.error('Test teardown failed:', error.message);
  }
}); 