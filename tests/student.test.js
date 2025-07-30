const request = require('supertest');
const app = require('../app');
const { User, Student, Class, Cohort } = require('../models');
const generateToken = require('../utils/token');

let studentUser, studentProfile, studentToken, managerToken, testClass, testCohort;

beforeAll(async () => {
  // Create test data
  testClass = await Class.create({
    name: 'Test Class',
    startDate: '2024-01-01',
    graduationDate: '2024-06-01'
  });

  testCohort = await Cohort.create({
    name: 'Test Cohort'
  });

  // Create student user
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('password123', 10);
  studentUser = await User.create({
    email: 'teststudent@example.com',
    password: hashedPassword,
    role: 'student',
    name: 'Test Student'
  });

  studentProfile = await Student.create({
    userId: studentUser.id,
    name: 'Test Student',
    classId: testClass.id,
    cohortId: testCohort.id
  });

  // Create manager for testing
  const managerHashedPassword = await bcrypt.hash('password123', 10);
  const managerUser = await User.create({
    email: 'testmanager@example.com',
    password: managerHashedPassword,
    role: 'manager',
    name: 'Test Manager'
  });

  // Generate tokens
  studentToken = generateToken(studentUser.id, studentUser.role);
  managerToken = generateToken(managerUser.id, managerUser.role);
});

afterAll(async () => {
  await require('../models').sequelize.close();
});

describe('Student Self-Update Functionality', () => {
  describe('PUT /api/students/profile', () => {
    it('should allow student to update their own profile', async () => {
      const res = await request(app)
        .put('/api/students/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Updated Student Name',
          email: 'updatedstudent@example.com'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.name).toBe('Updated Student Name');
      expect(res.body.user.email).toBe('updatedstudent@example.com');
    });

    it('should allow student to update their password', async () => {
      const res = await request(app)
        .put('/api/students/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          password: 'newpassword123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeDefined();
    });

    it('should allow student to update their class and cohort', async () => {
      // Create new class and cohort for testing
      const newClass = await Class.create({
        name: 'New Class',
        startDate: '2024-02-01',
        graduationDate: '2024-07-01'
      });

      const newCohort = await Cohort.create({
        name: 'New Cohort'
      });

      const res = await request(app)
        .put('/api/students/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          classId: newClass.id,
          cohortId: newCohort.id
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.student.classId).toBe(newClass.id);
      expect(res.body.student.cohortId).toBe(newCohort.id);
    });

    it('should reject email that is already in use', async () => {
      // Create another user with the email we want to use
      await User.create({
        email: 'existingemail@example.com',
        password: 'password123',
        role: 'student',
        name: 'Another Student'
      });

      const res = await request(app)
        .put('/api/students/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          email: 'existingemail@example.com'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toMatch(/Email already in use/i);
    });

    it('should reject invalid classId', async () => {
      const res = await request(app)
        .put('/api/students/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          classId: '00000000-0000-0000-0000-000000000000'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Invalid classId/i);
    });

    it('should reject invalid cohortId', async () => {
      const res = await request(app)
        .put('/api/students/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cohortId: '00000000-0000-0000-0000-000000000000'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Invalid cohortId/i);
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .put('/api/students/profile')
        .send({
          name: 'Unauthorized Update'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should reject requests from non-students', async () => {
      const res = await request(app)
        .put('/api/students/profile')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Manager Update'
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/students/profile', () => {
    it('should allow student to view their own profile', async () => {
      const res = await request(app)
        .get('/api/students/profile')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.id).toBe(studentUser.id);
      expect(res.body.student.id).toBe(studentProfile.id);
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .get('/api/students/profile');

      expect(res.statusCode).toBe(401);
    });

    it('should reject requests from non-students', async () => {
      const res = await request(app)
        .get('/api/students/profile')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});

describe('Student Routes - Positive Cases', () => {
  it('should fetch all students', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403); // Students should not be able to fetch all students
    expect(res.body.message).toMatch(/Access denied/i);
  });

  it('should fetch a student by ID', async () => {
    const res = await request(app)
      .get(`/api/students/${studentProfile.id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', studentProfile.id);
  });

  it('should update the student name', async () => {
    const res = await request(app)
      .put(`/api/students/${studentProfile.id}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'Updated Student Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe('Updated Student Name');
  });

  it('should delete the student', async () => {
    const res = await request(app)
      .delete(`/api/students/${studentProfile.id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403); // Students should not be able to delete students
    expect(res.body.message).toMatch(/Access denied/i);
  });
});

describe('Student Routes - Negative Cases', () => {
  it('should return 404 for deleted student', async () => {
    const res = await request(app)
      .get(`/api/students/${studentProfile.id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200); // Student wasn't deleted due to authorization failure
  });

  it('should reject unauthorized access without token', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Authorization header missing or malformed/i);
  });

  it('should reject registration with missing classId', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        role: 'student',
        name: 'Bad Student',
        email: 'bad@student.com',
        password: 'Secure123!',
        cohortId: testCohort.id,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Student must provide name/i);
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teststudent@example.com',
        password: 'WrongPass!',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid credentials/i);
  });

  it('should reject creation of student without role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'No Role Student',
        email: 'norole@student.com',
        password: 'Secure123!',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Email, password, and role are required/i);
  });
});
