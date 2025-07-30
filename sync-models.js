const sequelize = require('./config/database');

// Sync models function - synchronizes all models with the database
async function syncModels(force = false) {
  try {
    // Import all models
    const { User, Manager, Facilitator, Student, Module, Class, Mode, Cohort, Allocation, ActivityLog } = require('./models');
    
    // Sync all models
    await sequelize.sync({ force });
    console.log('All models synced successfully');
    
    if (force) {
      console.log('Database tables recreated (force: true)');
    }
  } catch (error) {
    console.error('Model sync failed:', error.message);
    throw error;
  }
}

// Initialize database function - sets up databases and syncs models
async function initializeDatabase(forceSync = false) {
  try {
    // First setup databases
    const { setupDatabase } = require('./setup-db');
    await setupDatabase();
    
    // Then sync models
    await syncModels(forceSync);
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
}

// Run sync if this file is executed directly
if (require.main === module) {
  const forceSync = process.argv.includes('--force');
  
  initializeDatabase(forceSync)
    .then(() => {
      console.log('Database sync completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncModels, initializeDatabase }; 