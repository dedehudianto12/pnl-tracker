import request from 'supertest';
import app from '../../src/app.js';

describe('Notification Integration Tests', () => {
  let token: string;
  let projectId: string;

  beforeEach(async () => {
    const user = await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });
    token = user.body.token;

    const project = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
        projectValue: 100000,
        deadline: '2025-12-31T00:00:00Z',
        overheadPercentage: 10,
      });
    projectId = project.body.id;
  });

  describe('Budget Warning Notifications', () => {
    it('should create notification when reaching 50% budget', async () => {
      // Add expense that triggers 50% warning
      await request(app)
        .post(`/api/v1/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'MATERIALS',
          name: 'Big Expense',
          estimatedCost: 60000,
          actualCost: 50000,
        });

      // Get project to trigger notification check
      await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      // Check notifications
      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].type).toBe('BUDGET_WARNING_50');
    });

    it('should create notification when reaching 75% budget', async () => {
      await request(app)
        .post(`/api/v1/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'MATERIALS',
          name: 'Big Expense',
          estimatedCost: 80000,
          actualCost: 75000,
        });

      await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const budgetWarning = response.body.find(
        (n: any) => n.type === 'BUDGET_WARNING_75'
      );
      expect(budgetWarning).toBeDefined();
    });

    it('should create notification when budget exceeded', async () => {
      await request(app)
        .post(`/api/v1/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'MATERIALS',
          name: 'Huge Expense',
          estimatedCost: 120000,
          actualCost: 110000,
        });

      await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const exceeded = response.body.find(
        (n: any) => n.type === 'BUDGET_EXCEEDED'
      );
      expect(exceeded).toBeDefined();
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('should get user notifications', async () => {
      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by status', async () => {
      // Create notification
      await request(app)
        .post(`/api/v1/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'MATERIALS',
          name: 'Expense',
          estimatedCost: 60000,
          actualCost: 50000,
        });

      await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .get('/api/v1/notifications?status=UNREAD')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.every((n: any) => n.status === 'UNREAD')).toBe(true);
    });
  });

  describe('PUT /api/v1/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      // Create notification
      await request(app)
        .post(`/api/v1/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          category: 'MATERIALS',
          name: 'Expense',
          estimatedCost: 60000,
          actualCost: 50000,
        });

      await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      const notifications = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`);

      const notificationId = notifications.body[0].id;

      const response = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('READ');
      expect(response.body.readAt).toBeTruthy();
    });
  });

  describe('GET /api/v1/notifications/unread-count', () => {
    it('should return correct unread count', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
    });
  });
});