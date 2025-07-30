const { ActivityLog, Allocation, Facilitator, User, Module } = require('../models');
const reminderQueue = require('../queues/Queue');
const { Op } = require('sequelize');

function isLogLate(week) {
  const now = new Date();
  const deadline = new Date();
  deadline.setDate(deadline.getDate() - ((deadline.getDay() + 6) % 7));
  return now > deadline;
}

// Create a new log
exports.createLog = async (req, res) => {
  try {
    const { allocationId, week, ...fields } = req.body;

    const allocation = await Allocation.findByPk(allocationId, {
      include: [{ model: Facilitator, include: [{ model: User }] }]
    });
    if (!allocation) return res.status(404).json({ error: 'Allocation not found' });

    // Ensure facilitator owns this allocation
    if (req.user.role === 'facilitator') {
      const facilitator = await Facilitator.findOne({ where: { userId: req.user.id } });
      if (!facilitator || allocation.facilitatorId !== facilitator.id) {
        return res.status(403).json({ error: 'You are not authorized to create logs for this allocation' });
      }
    }

    const newLog = await ActivityLog.create({ allocationId, week, ...fields });
    
    // Trigger notification to manager about log submission
    if (allocation.Facilitator && allocation.Facilitator.User) {
      await reminderQueue.add('log-submitted', {
        facilitatorEmail: allocation.Facilitator.User.email,
        facilitatorName: allocation.Facilitator.User.name,
        week: week,
        allocationId: allocationId,
        message: `Activity log submitted for week ${week}`,
        subject: 'Activity Log Submitted'
      });
    }

    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create activity log' });
  }
};

// Get all logs (with optional filtering)
exports.getAllLogs = async (req, res) => {
  try {
    const { facilitatorId, moduleId, week, status, gradingStatus } = req.query;
    const where = {};
    const include = [{ 
      model: Allocation,
      include: [
        { model: Facilitator, include: [{ model: User, attributes: ['id', 'name', 'email'] }] },
        { model: Module, attributes: ['id', 'name'] }
      ]
    }];

    if (facilitatorId || moduleId) {
      include[0].where = {};
      if (facilitatorId) include[0].where.facilitatorId = facilitatorId;
      if (moduleId) include[0].where.moduleId = moduleId;
    }

    if (week) where.week = week;
    if (status) {
      // Filter by any grading status field
      where[Op.or] = [
        { formativeOneGrading: status },
        { formativeTwoGrading: status },
        { summativeGrading: status },
        { courseModeration: status },
        { intranetSync: status },
        { gradeBookStatus: status }
      ];
    }
    if (gradingStatus) {
      // Filter by specific grading field
      where[gradingStatus] = req.query.gradingStatusValue || 'Pending';
    }

    const logs = await ActivityLog.findAll({ where, include });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

// Get one log
exports.getLogById = async (req, res) => {
  try {
    const log = await ActivityLog.findByPk(req.params.id, { 
      include: [{ 
        model: Allocation,
        include: [
          { model: Facilitator, include: [{ model: User, attributes: ['id', 'name', 'email'] }] },
          { model: Module, attributes: ['id', 'name'] }
        ]
      }]
    });
    if (!log) return res.status(404).json({ error: 'Log not found' });

    if (req.user.role === 'facilitator') {
      const facilitator = await Facilitator.findOne({ where: { userId: req.user.id } });
      if (!facilitator || log.Allocation.facilitatorId !== facilitator.id) {
        return res.status(403).json({ error: 'Access denied to this log' });
      }
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch log' });
  }
};

// Update log (facilitator or manager)
exports.updateLog = async (req, res) => {
  try {
    const log = await ActivityLog.findByPk(req.params.id, { 
      include: [{ 
        model: Allocation,
        include: [
          { model: Facilitator, include: [{ model: User }] }
        ]
      }]
    });
    if (!log) return res.status(404).json({ error: 'Log not found' });

    if (req.user.role === 'facilitator') {
      const facilitator = await Facilitator.findOne({ where: { userId: req.user.id } });
      if (!facilitator || log.Allocation.facilitatorId !== facilitator.id) {
        return res.status(403).json({ error: 'You can only update your own logs' });
      }
    }

    await log.update(req.body);
    
    // Trigger notification if grading status changed
    if (req.body.formativeOneGrading || req.body.formativeTwoGrading || req.body.summativeGrading) {
      if (log.Allocation.Facilitator && log.Allocation.Facilitator.User) {
        await reminderQueue.add('grading-updated', {
          facilitatorEmail: log.Allocation.Facilitator.User.email,
          facilitatorName: log.Allocation.Facilitator.User.name,
          week: log.week,
          allocationId: log.allocationId,
          message: `Grading status updated for week ${log.week}`,
          subject: 'Grading Status Updated'
        });
      }
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update log' });
  }
};

// Delete log (manager only)
exports.deleteLog = async (req, res) => {
  try {
    const log = await ActivityLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });

    await log.destroy();
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete log' });
  }
};

// Get overdue logs for reminders
exports.getOverdueLogs = async (req, res) => {
  try {
    const currentWeek = Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
    
    const overdueLogs = await ActivityLog.findAll({
      where: {
        week: { [Op.lt]: currentWeek }
      },
      include: [{ 
        model: Allocation,
        include: [
          { model: Facilitator, include: [{ model: User, attributes: ['id', 'name', 'email'] }] },
          { model: Module, attributes: ['id', 'name'] }
        ]
      }]
    });

    res.json(overdueLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch overdue logs' });
  }
};
