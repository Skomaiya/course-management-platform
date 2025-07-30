const reminderQueue = require('../queues/Queue');
const { ActivityLog, Allocation, Facilitator, User, Manager, Module } = require('../models');
const { Op } = require('sequelize');

class NotificationWorker {
  constructor() {
    this.isRunning = false;
    this.checkInterval = null;
  }

  // Start the background worker
  start() {
    if (this.isRunning) {
      console.log('Notification worker is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting notification worker...');

    // Check for overdue logs every hour
    this.checkInterval = setInterval(() => {
      this.checkOverdueLogs();
    }, 60 * 60 * 1000); // 1 hour

    // Initial check
    this.checkOverdueLogs();

    // Weekly reminder check (every Monday at 9 AM)
    this.scheduleWeeklyReminders();
  }

  // Stop the background worker
  stop() {
    if (!this.isRunning) {
      console.log('Notification worker is not running');
      return;
    }

    this.isRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('Stopped notification worker');
  }

  // Check for overdue logs and send reminders
  async checkOverdueLogs() {
    try {
      const currentWeek = Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
      const deadline = new Date();
      deadline.setDate(deadline.getDate() - ((deadline.getDay() + 6) % 7));
      
      const overdueLogs = await ActivityLog.findAll({
        where: {
          week: { [Op.lt]: currentWeek }
        },
        include: [{ 
          model: Allocation,
          include: [
            { model: Facilitator, include: [{ model: User, attributes: ['email', 'name'] }] },
            { model: Module, attributes: ['name'] }
          ]
        }]
      });
      
      console.log(`Found ${overdueLogs.length} overdue logs`);
      
      for (const log of overdueLogs) {
        if (log.Allocation.Facilitator && log.Allocation.Facilitator.User) {
          await reminderQueue.add('overdue-reminder', {
            facilitatorEmail: log.Allocation.Facilitator.User.email,
            facilitatorName: log.Allocation.Facilitator.User.name,
            week: log.week,
            allocationId: log.allocationId,
            deadline: deadline.toDateString()
          });
        }
      }
    } catch (error) {
      console.error('Failed to check overdue logs:', error);
    }
  }

  // Schedule weekly reminders
  scheduleWeeklyReminders() {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() + (8 - now.getDay()) % 7);
    monday.setHours(9, 0, 0, 0);

    const timeUntilMonday = monday.getTime() - now.getTime();
    
    setTimeout(() => {
      this.sendWeeklyReminders();
      // Schedule for next Monday
      setInterval(() => {
        this.sendWeeklyReminders();
      }, 7 * 24 * 60 * 60 * 1000); // 7 days
    }, timeUntilMonday);
  }

  // Send weekly reminders to all facilitators
  async sendWeeklyReminders() {
    try {
      const currentWeek = Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
      
      const facilitators = await Facilitator.findAll({
        include: [
          { model: User, attributes: ['email', 'name'] },
          { model: Allocation, include: [{ model: Module, attributes: ['name'] }] }
        ]
      });

      for (const facilitator of facilitators) {
        if (facilitator.User && facilitator.User.email && facilitator.Allocations.length > 0) {
          for (const allocation of facilitator.Allocations) {
            await reminderQueue.add('weekly-reminder', {
              facilitatorEmail: facilitator.User.email,
              facilitatorName: facilitator.User.name,
              week: currentWeek,
              allocationId: allocation.id
            });
          }
        }
      }
      
      console.log(`Sent weekly reminders to ${facilitators.length} facilitators`);
    } catch (error) {
      console.error('Failed to send weekly reminders:', error);
    }
  }

  // Get queue statistics
  async getQueueStats() {
    try {
      const waiting = await reminderQueue.getWaiting();
      const active = await reminderQueue.getActive();
      const completed = await reminderQueue.getCompleted();
      const failed = await reminderQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length
      };
    } catch (error) {
      console.error('Failed to get queue stats:', error);
      return null;
    }
  }

  // Clear completed jobs
  async clearCompletedJobs() {
    try {
      await reminderQueue.clean(24 * 60 * 60 * 1000, 'completed'); // 24 hours
      await reminderQueue.clean(24 * 60 * 60 * 1000, 'failed'); // 24 hours
      console.log('🧹 Cleared completed and failed jobs');
    } catch (error) {
      console.error('Failed to clear completed jobs:', error);
    }
  }
}

module.exports = new NotificationWorker(); 