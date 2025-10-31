import request from 'supertest';
import app from '../../src/app.js';
import { createTestUser } from '../utils/testHelpers.js';

describe('Project Integration Tests', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });
    token = response.body.token;
    userId = response.body.user.id;
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Project',
          description: 'Test Description',
          projectValue: 50000,
          deadline: '2025-12-31T00:00:00Z',
          overheadPercentage: 10,
          currency: 'USD',
        })
        .expect(201);

      expect(response.body.name).toBe('Test Project');
      expect(response.body.ownerId).toBe(userId);
      expect(response.body.status).toBe('ACTIVE');
    });

    it('should return 400 for invalid data', async () => {
      await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '',
          projectValue: -1000,
        })
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/v1/projects')
        .send({
          name: 'Test Project',
          projectValue: 50000,
          deadline: '2025-12-31T00:00:00Z',
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/projects', () => {
    beforeEach(async () => {
      // Create test projects
      await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Project 1',
          projectValue: 50000,
          deadline: '2025-12-31T00:00:00Z',
        });

      await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Project 2',
          projectValue: 75000,
          deadline: '2026-01-31T00:00:00Z',
        });
    });

    it('should get all user projects', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('calculations');
    });

    it('should include projects where user is member', async () => {
      // Create another user and project
      const owner = await request(app).post('/api/v1/auth/register').send({
        email: 'owner@example.com',
        password: 'password123',
        name: 'Owner',
      });

      const project = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${owner.body.token}`)
        .send({
          name: 'Shared Project',
          projectValue: 100000,
          deadline: '2025-12-31T00:00:00Z',
        });

      // Add current user as member
      await request(app)
        .post(`/api/v1/projects/${project.body.id}/members`)
        .set('Authorization', `Bearer ${owner.body.token}`)
        .send({
          email: 'test@example.com',
          role: 'EDITOR',
        });

      const response = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Project Member Management', () => {
    let projectId: string;

    beforeEach(async () => {
      const project = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Project',
          projectValue: 50000,
          deadline: '2025-12-31T00:00:00Z',
        });
      projectId = project.body.id;
    });

    it('should add member to project', async () => {
      // Create new user
      await request(app).post('/api/v1/auth/register').send({
        email: 'member@example.com',
        password: 'password123',
        name: 'Member',
      });

      const response = await request(app)
        .post(`/api/v1/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'member@example.com',
          role: 'EDITOR',
        })
        .expect(201);

      expect(response.body.role).toBe('EDITOR');
      expect(response.body.user.email).toBe('member@example.com');
    });

    it('should not allow non-owner to add members', async () => {
      const member = await request(app).post('/api/v1/auth/register').send({
        email: 'member@example.com',
        password: 'password123',
        name: 'Member',
      });

      await request(app)
        .post(`/api/v1/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${member.body.token}`)
        .send({
          email: 'another@example.com',
          role: 'VIEWER',
        })
        .expect(400);
    });
  });
});