require("dotenv").config();
const express = require("express");
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');
const indexRoutes = require("./routes/indexRoutes");
const redis = require("redis");

const app = express();

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

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Course Management Platform API Documentation'
}));

app.use(indexRoutes);

module.exports = app;
