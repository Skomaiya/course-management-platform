const Queue = require('bull');

const reminderQueue = new Queue('log-reminders', {
  redis: { port: 6379, host: '127.0.0.1' }
});

module.exports = reminderQueue;
