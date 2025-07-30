const reminderQueue = require('../queues/Queue');
const sendEmail = require('../utils/emailService');
const { ActivityLog, Allocation, Facilitator, User, Manager, Module } = require('../models');
const { Op } = require('sequelize');

// Process different types of notifications
reminderQueue.process('log-submitted', async (job) => {
  const { facilitatorEmail, facilitatorName, week, allocationId, message, subject } = job.data;
  
  try {
    // Send notification to facilitator
    await sendEmail(facilitatorEmail, subject || 'Log Submission Confirmation', message);
    console.log(`Log submission confirmation sent to ${facilitatorEmail}`);
    
    // Send notification to managers
    const managers = await Manager.findAll({
      include: [{ model: User, attributes: ['email', 'name'] }]
    });
    
    for (const manager of managers) {
      if (manager.User && manager.User.email) {
        await sendEmail(
          manager.User.email,
          'Activity Log Submitted - Manager Notification',
          `Facilitator ${facilitatorName} has submitted their activity log for week ${week} (Allocation: ${allocationId})`
        );
        console.log(`Manager notification sent to ${manager.User.email}`);
      }
    }
  } catch (error) {
    console.error('Failed to send log submission notifications:', error);
  }
});

reminderQueue.process('grading-updated', async (job) => {
  const { facilitatorEmail, facilitatorName, week, allocationId, message, subject } = job.data;
  
  try {
    // Send notification to facilitator
    await sendEmail(facilitatorEmail, subject || 'Grading Status Updated', message);
    console.log(`Grading update notification sent to ${facilitatorEmail}`);
    
    // Send notification to managers
    const managers = await Manager.findAll({
      include: [{ model: User, attributes: ['email', 'name'] }]
    });
    
    for (const manager of managers) {
      if (manager.User && manager.User.email) {
        await sendEmail(
          manager.User.email,
          'Grading Status Updated - Manager Notification',
          `Facilitator ${facilitatorName} has updated grading status for week ${week} (Allocation: ${allocationId})`
        );
        console.log(`Manager notification sent to ${manager.User.email}`);
      }
    }
  } catch (error) {
    console.error('Failed to send grading update notifications:', error);
  }
});

reminderQueue.process('overdue-reminder', async (job) => {
  const { facilitatorEmail, facilitatorName, week, allocationId, deadline } = job.data;
  
  try {
    const message = `Dear ${facilitatorName},\n\nThis is a reminder that your activity log for week ${week} (Allocation: ${allocationId}) is overdue. The deadline was ${deadline}.\n\nPlease submit your log as soon as possible.\n\nBest regards,\nCourse Management Platform`;
    
    await sendEmail(
      facilitatorEmail,
      'URGENT: Overdue Activity Log Reminder',
      message
    );
    console.log(`📧 Overdue reminder sent to ${facilitatorEmail}`);
    
    // Send urgent notification to managers
    const managers = await Manager.findAll({
      include: [{ model: User, attributes: ['email', 'name'] }]
    });
    
    for (const manager of managers) {
      if (manager.User && manager.User.email) {
        await sendEmail(
          manager.User.email,
          'URGENT: Overdue Activity Log Alert',
          `Facilitator ${facilitatorName} has an overdue activity log for week ${week} (Allocation: ${allocationId}). Deadline was ${deadline}.`
        );
        console.log(`Urgent manager alert sent to ${manager.User.email}`);
      }
    }
  } catch (error) {
    console.error('Failed to send overdue reminder notifications:', error);
  }
});

reminderQueue.process('weekly-reminder', async (job) => {
  const { facilitatorEmail, facilitatorName, week, allocationId } = job.data;
  
  try {
    const message = `Dear ${facilitatorName},\n\nThis is a friendly reminder to submit your activity log for week ${week} (Allocation: ${allocationId}).\n\nThe deadline is approaching. Please ensure all grading, moderation, and sync tasks are completed and logged.\n\nBest regards,\nCourse Management Platform`;
    
    await sendEmail(
      facilitatorEmail,
      'Weekly Activity Log Reminder',
      message
    );
    console.log(`Weekly reminder sent to ${facilitatorEmail}`);
  } catch (error) {
    console.error('Failed to send weekly reminder:', error);
  }
});

// Background worker to check for overdue logs and send reminders
const checkOverdueLogs = async () => {
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
    
    console.log(`Checked for overdue logs: ${overdueLogs.length} found`);
  } catch (error) {
    console.error('Failed to check overdue logs:', error);
  }
};

// Run overdue check every hour
setInterval(checkOverdueLogs, 60 * 60 * 1000);

// Initial check
checkOverdueLogs();

module.exports = { checkOverdueLogs };
