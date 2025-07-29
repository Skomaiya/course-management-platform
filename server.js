require("dotenv").config();
const express = require("express");
const app = express();
const sequelize = require("./config/database");
const redis = require("redis");
const models = require("./models");
const moduleRoutes = require("./routes/moduleRoutes");
const classRoutes = require("./routes/classRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facilitatorRoutes = require("./routes/facilitatorRoutes");
const allocationRoutes = require("./routes/allocationRoutes");
const authRoutes = require("./routes/authRoutes");

// Redis setup
const redisClient = redis.createClient();

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully.");
});

// Middleware
app.use(express.json());

app.use("/api/modules", moduleRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/facilitators", facilitatorRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api", authRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Course Management Platform API is running." });
});

// Start server after DB connection check
const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }).then(() => {
      console.log("All models were synchronized successfully.");
    });
    console.log("Connected to MySQL database successfully.");
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }

})();

module.exports = app;
