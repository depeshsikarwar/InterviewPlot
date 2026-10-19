import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/prisma';

const app = createApp();

describe('Auth API Integration Tests', () => {
  const testUser = {
    email: `test_${Date.now()}@interviewpilot.ai`,
    password: 'Password123!',
    fullName: 'Test Candidate',
    targetRole: 'Frontend Developer',
  };

  let authToken: string;

  afterAll(async () => {
    // Cleanup test user
    await prisma.user.deleteMany({
      where: { email: { contains: 'test_' } },
    });
    await prisma.$disconnect();
  });

  it('should reject registration if email is invalid or password too weak', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'not-an-email',
      password: 'weak',
      fullName: 'A',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should successfully register a valid new user and return tokens and user profile', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.tokens.accessToken).toBeDefined();

    authToken = res.body.data.tokens.accessToken;
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword999!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should successfully log in with valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should fetch authenticated user profile via /api/v1/auth/me', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.profile.fullName).toBe(testUser.fullName);
  });

  it('should reject access to protected route when no token is provided', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
