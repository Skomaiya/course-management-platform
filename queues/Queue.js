const Queue = require('bull');

const reminderQueue = new Queue('log-reminders', {
  redis: { 
    port: process.env.REDIS_PORT || 6379, 
    host: process.env.REDIS_HOST || '127.0.0.1' 
  }
});

module.exports = reminderQueue;
