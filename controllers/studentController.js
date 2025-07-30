const { Student, Class, Cohort, User } = require('../models');
const bcrypt = require('bcryptjs');

// Create a new student and associated user
const createStudent = async (req, res) => {
  try {
    const { name, email, password, classId, cohortId } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
    });

    const student = await Student.create({
      userId: user.id,
      classId,
      cohortId,
    });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      student: {
        id: student.id,
        classId: student.classId,
        cohortId: student.cohortId,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update own student profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password, classId, cohortId } = req.body;

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const student = await Student.findOne({ where: { userId } });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    user.name = name || user.name;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Validate classId and cohortId if provided
    if (classId && classId !== student.classId) {
      const classObj = await Class.findByPk(classId);
      if (!classObj) {
        return res.status(400).json({ message: 'Invalid classId: class does not exist' });
      }
      student.classId = classId;
    }
    if (cohortId && cohortId !== student.cohortId) {
      const cohortObj = await Cohort.findByPk(cohortId);
      if (!cohortObj) {
        return res.status(400).json({ message: 'Invalid cohortId: cohort does not exist' });
      }
      student.cohortId = cohortId;
    }

    await user.save();
    await student.save();

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      student: {
        id: student.id,
        classId: student.classId,
        cohortId: student.cohortId,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name'],
        },
        {
          model: Cohort,
          as: 'cohort',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get own student profile
const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await Student.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Class,
          attributes: ['id', 'name'],
        },
        {
          model: Cohort,
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json({
      user: {
        id: student.User.id,
        name: student.User.name,
        email: student.User.email,
      },
      student: {
        id: student.id,
        classId: student.classId,
        cohortId: student.cohortId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Class,
          attributes: ['id', 'name'],
        },
        {
          model: Cohort,
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update student (Admin/Manager access)
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, classId, cohortId } = req.body;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const user = await User.findByPk(student.userId);
    if (!user) {
      return res.status(404).json({ message: 'Associated user not found' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    user.name = name || user.name;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Validate classId and cohortId if provided
    if (classId && classId !== student.classId) {
      const classObj = await Class.findByPk(classId);
      if (!classObj) {
        return res.status(400).json({ message: 'Invalid classId: class does not exist' });
      }
      student.classId = classId;
    }
    if (cohortId && cohortId !== student.cohortId) {
      const cohortObj = await Cohort.findByPk(cohortId);
      if (!cohortObj) {
        return res.status(400).json({ message: 'Invalid cohortId: cohort does not exist' });
      }
      student.cohortId = cohortId;
    }

    await user.save();
    await student.save();

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      student: {
        id: student.id,
        classId: student.classId,
        cohortId: student.cohortId,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete student and associated user
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const user = await User.findByPk(student.userId);
    if (user) {
      await user.destroy();
    }

    await student.destroy();

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createStudent,
  updateProfile,
  getAllStudents,
  getStudentProfile,
  getStudentById,
  updateStudent,
  deleteStudent,
};
