const sequelize = require("./config/database");
const app = require("./app");
const notification = require("./services/Notification");
const reminderService = require("./services/Reminder");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    
    // Sync database without dropping in all environments
    if (process.env.NODE_ENV !== 'test') {
      await sequelize.sync({ alter: true });
    } else {
      // In test environment, use force to ensure clean state
      await sequelize.sync({ force: true });
    }
    
    console.log("Connected to MySQL database successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      // Start notification worker in non-test environments
      if (process.env.NODE_ENV !== 'test') {
        try {
          notification.start();
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

if (require.main === module) {
  startServer();
}

module.exports = app;
