const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/config');
const { Student } = require('../models');
const generateToken = require('../utils/token');

let createdStudentId;
let studentToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Pre-register a student user and get a token for protected routes
  const student = await Student.create({
    name: 'Auth Student',
    email: 'auth@student.com',
    password: 'hashed_password',
    classId: '123e4567-e89b-12d3-a456-426614174000',
    cohortId: '987e6543-e21b-45c3-a123-123456789000',
  });

  studentToken = generateToken(student.id, 'student');
});

afterAll(async () => {
  await sequelize.close();
});

describe('Student API Integration Tests', () => {
  const studentData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123',
    classId: '123e4567-e89b-12d3-a456-426614174000',
    cohortId: '987e6543-e21b-45c3-a123-123456789000',
  };

  it('should create a new student', async () => {
    const res = await request(app)
      .post('/api/students')
      .send(studentData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(studentData.email);

    createdStudentId = res.body.id;
  });

  it('should fetch all students', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should fetch a student by ID', async () => {
    const res = await request(app)
      .get(`/api/students/${createdStudentId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdStudentId);
  });

  it('should update a student', async () => {
    const res = await request(app)
      .put(`/api/students/${createdStudentId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'Updated Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Name');
  });

  it('should delete a student', async () => {
    const res = await request(app)
      .delete(`/api/students/${createdStudentId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Student deleted successfully.');
  });

  it('should return 404 for deleted student', async () => {
    const res = await request(app)
      .get(`/api/students/${createdStudentId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(404);
  });
});
