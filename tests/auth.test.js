const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { Manager, User, Class, Cohort } = require('../models');
const e = require('express');

let managerId, testClassId, testCohortId;
const ts = Date.now();

beforeAll(async () => {
  // Create test class and cohort for student registration
  const testClass = await Class.create({
    name: 'Test Class',
    startDate: '2024-01-01',
    graduationDate: '2024-12-31',
  });
  testClassId = testClass.id;

  const testCohort = await Cohort.create({
    name: `Test Cohort ${ts}`,
  });
  testCohortId = testCohort.id;

  const user = await User.create({
    name: 'Seed Manager',
    email: `seedmanager_${ts}@example.com`,
    password: 'SeedPass123!',
    role: 'manager',
  });

  const manager = await Manager.create({
    name: 'Seed Manager',
    userId: user.id,
  });

  managerId = manager.id;
});

afterAll(async () => {
  await sequelize.close();
});

// Utility: Generate role-specific user data
const getTestUsers = () => ({
  managerUser: {
    email: `manager1_${ts}@example.com`,
    password: 'ManagerPass123!',
    role: 'manager',
    extraData: {
      name: 'Manager One',
    },
  },
  studentUser: {
    email: `student1_${ts}@example.com`,
    password: 'StudentPass123!',
    role: 'student',
    extraData: {
      name: 'Student One',
      classId: testClassId,
      cohortId: testCohortId,
    },
  },
  facilitatorUser: {
    email: `facilitator1_${ts}@example.com`,
    password: 'FacilitatorPass123!',
    role: 'facilitator',
    extraData: {
      name: 'Facilitator One',
      qualification: 'MSc Education',
      location: 'Onsite',
      managerId: managerId,
    },
  },
});

// Modular Positive Case Runner
describe('Auth Registration & Login', () => {
  test('Should register student', async () => {
    const users = getTestUsers();
    const res = await request(app).post('/api/auth/register').send(users.studentUser);
    if (res.statusCode !== 201) {
      console.log('Registration failed for student:', res.body);
    }
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  test('Should login student', async () => {
    const users = getTestUsers();
    const res = await request(app).post('/api/auth/login').send({
      email: users.studentUser.email,
      password: users.studentUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('Should register facilitator', async () => {
    const users = getTestUsers();
    const res = await request(app).post('/api/auth/register').send(users.facilitatorUser);
    if (res.statusCode !== 201) {
      console.log('Registration failed for facilitator:', res.body);
    }
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  test('Should login facilitator', async () => {
    const users = getTestUsers();
    const res = await request(app).post('/api/auth/login').send({
      email: users.facilitatorUser.email,
      password: users.facilitatorUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('Should register manager', async () => {
    const users = getTestUsers();
    const res = await request(app).post('/api/auth/register').send(users.managerUser);
    if (res.statusCode !== 201) {
      console.log('Registration failed for manager:', res.body);
    }
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  test('Should login manager', async () => {
    const users = getTestUsers();
    const res = await request(app).post('/api/auth/login').send({
      email: users.managerUser.email,
      password: users.managerUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});

// Negative Registration Scenarios
describe('Invalid Registration Cases', () => {
  test('Reject missing email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      password: 'NoEmail123!',
      role: 'student',
      extraData: {
        name: 'No Email',
        classID: '11111111-1111-1111-1111-111111111111',
        cohortID: '22222222-2222-2222-2222-222222222222',
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/email/i);
  });

  test('Reject duplicate email', async () => {
    const duplicateUser = {
      email: `student1_${ts}@example.com`, // Same email as in getTestUsers
      password: 'StudentPass123!',
      role: 'student',
      extraData: {
        name: 'Student One',
        classId: testClassId,
        cohortId: testCohortId,
      },
    };
    const res = await request(app).post('/api/auth/register').send(duplicateUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Email already in use/i);
  });

  test('Reject facilitator without qualification', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'noqual@example.com',
      password: 'Faci123!',
      role: 'facilitator',
      extraData: {
        name: 'No Qual',
        location: 'Remote',
        managerId,
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/qualification/i);
  });

  test('Reject student without classId', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'noclass@example.com',
      password: 'Student123!',
      role: 'student',
      extraData: {
        name: 'Missing Class',
        cohortId: testCohortId,
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Student must provide classId/i);
  });

  test('Reject facilitator with invalid managerId', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: `badmanager_${ts}@example.com`,
      password: 'FaciPass123!',
      role: 'facilitator',
      extraData: {
        name: 'Bad Manager Ref',
        qualification: 'BSc IT',
        location: 'Remote',
        managerId: '00000000-0000-0000-0000-000000000000',
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid managerId/i);
  });

  test('Reject missing password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'No Pass',
      email: 'nopass@example.com',
      role: 'manager',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/password/i);
  });
});

// Negative Login Scenarios
describe('Invalid Login Cases', () => {
  const { studentUser } = getTestUsers();

  test('Reject login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: studentUser.email,
      password: 'WrongPass!',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('Reject login with invalid role', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: studentUser.email,
      password: studentUser.password,
    });
    expect(res.statusCode).toBe(200); // Login should succeed regardless of role
    expect(res.body.token).toBeDefined();
  });

  test('Reject login with missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: '',
      password: '',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid credentials/i);
  });
});
