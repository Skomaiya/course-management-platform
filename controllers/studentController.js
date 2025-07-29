const { Student, Class, Cohort } = require('../models');
const bcrypt = require('bcryptjs');

// Create a new student
const createStudent = async (req, res) => {
  try {
    const { name, email, password, classId, cohortId } = req.body;

    // Check if email already exists
    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await Student.create({
      name,
      email,
      password: hashedPassword,
      classId,
      cohortId,
    });

    res.status(201).json({
      id: newStudent.id,
      name: newStudent.name,
      email: newStudent.email,
      classId: newStudent.classId,
      cohortId: newStudent.cohortId,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update own student profile
const updateProfile = async (req, res) => {
  try {
    const studentId = req.user.id; // authenticated user's ID
    const { name, email, password, classId, cohortId } = req.body;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (email && email !== student.email) {
      const existing = await Student.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      student.email = email;
    }

    student.name = name || student.name;
    student.classId = classId || student.classId;
    student.cohortId = cohortId || student.cohortId;

    if (password) {
      student.password = await bcrypt.hash(password, 10);
    }

    await student.save();

    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      classId: student.classId,
      cohortId: student.cohortId,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      attributes: { exclude: ['password'] },
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name'] },
        { model: Cohort, as: 'cohort', attributes: ['id', 'name'] },
      ],
    });

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name'] },
        { model: Cohort, as: 'cohort', attributes: ['id', 'name'] },
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

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, classId, cohortId } = req.body;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (email && email !== student.email) {
      const existingEmail = await Student.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      student.email = email;
    }

    student.name = name || student.name;
    student.classId = classId || student.classId;
    student.cohortId = cohortId || student.cohortId;

    if (password) {
      student.password = await bcrypt.hash(password, 10);
    }

    await student.save();

    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      classId: student.classId,
      cohortId: student.cohortId,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
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
  getStudentById,
  updateStudent,
  deleteStudent,
};
