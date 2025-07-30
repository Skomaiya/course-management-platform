const request = require('supertest');
const app = require('../app');
const { User, Manager } = require('../models');
const generateToken = require('../utils/token');

describe('Manager API Integration Tests', () => {
  let managerUser, managerProfile, managerToken;

  beforeAll(async () => {
    // Create a test manager user and profile
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('authpass123', 10);
    managerUser = await User.create({
      email: 'managerauth@example.com',
      password: hashedPassword,
      role: 'manager',
      name: 'Test Manager'
    });

    managerProfile = await Manager.create({
      name: 'Test Manager Profile',
      userId: managerUser.id
    });

    managerToken = generateToken(managerUser.id, managerUser.role);
  });

  describe('Positive Use Cases', () => {
    test('should register a new manager user with valid fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newmanager@example.com',
          password: 'password123',
          role: 'manager',
          extraData: {
            name: 'New Manager'
          }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('manager');
    });

    test('should login manager with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'managerauth@example.com',
          password: 'authpass123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('manager');
    });

    test('should get manager profile', async () => {
      const res = await request(app)
        .get(`/api/managers/${managerProfile.id}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Test Manager Profile');
    });
  });

  describe('Negative Use Cases', () => {
    test('should reject registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'managerauth@example.com',
          password: 'password123',
          role: 'manager',
          extraData: {
            name: 'Duplicate Manager'
          }
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email already in use');
    });

    test('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'managerauth@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
