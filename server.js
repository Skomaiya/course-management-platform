const sequelize = require("./config/database");
const app = require("./app");
const notificationWorker = require("./services/NotificationWorker");
const reminderService = require("./services/Reminder"); // Import to initialize Redis queue processors

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    
    // Sync database in all environments, but only drop in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      await sequelize.drop();
      await sequelize.sync({ force: true });
    } else {
      // In test environment, just sync without dropping
      await sequelize.sync({ force: true });
    }
    
    console.log("Connected to MySQL database successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      // Start notification worker in non-test environments
      if (process.env.NODE_ENV !== 'test') {
        try {
          notificationWorker.start();
        } catch (error) {
          console.error('Failed to start notification worker:', error.message);
        }
      }
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

// Only run if not imported (e.g. in tests)
if (require.main === module) {
  startServer();
}

module.exports = app;
