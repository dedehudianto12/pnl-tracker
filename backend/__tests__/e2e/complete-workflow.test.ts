import request from 'supertest';
import app from '../../src/app.js';

describe('Complete Workflow E2E Test', () => {
  it('should complete full project lifecycle with notifications', async () => {
    // 1. Register user
    const user = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'project-manager@example.com',
        password: 'secure123',
        name: 'Project Manager',
      })
      .expect(201);

    const token = user.body.token;

    // 2. Create project
    const project = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Website Development',
        description: 'Complete website redesign',
        projectValue: 100000,
        deadline: '2025-12-31T00:00:00Z',
        overheadPercentage: 10,
        currency: 'USD',
      })
      .expect(201);

    const projectId = project.body.id;

    // 3. Add team member
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'developer@example.com',
        password: 'secure123',
        name: 'Developer',
      });

    await request(app)
      .post(`/api/v1/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'developer@example.com',
        role: 'EDITOR',
      })
      .expect(201);

    // 4. Add milestones
    const milestone1 = await request(app)
      .post(`/api/v1/projects/${projectId}/milestones`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Design Phase',
        targetDate: '2025-11-30T00:00:00Z',
        completionPercentage: 0,
        estimatedHours: 120,
      })
      .expect(201);

    // 5. Add expenses (trigger 50% warning)
    await request(app)
      .post(`/api/v1/projects/${projectId}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'MATERIALS',
        name: 'Design Software',
        estimatedCost: 30000,
        actualCost: 28000,
      })
      .expect(201);

    await request(app)
      .post(`/api/v1/projects/${projectId}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'MANPOWER',
        name: 'Development Team',
        estimatedCost: 25000,
        actualCost: 22000,
      })
      .expect(201);

    // 6. Get project with calculations
    const projectDetails = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(projectDetails.body).toHaveProperty('calculations');
    expect(projectDetails.body).toHaveProperty('alerts');
    expect(projectDetails.body.calculations.totalActualCost).toBe(50000);
    expect(projectDetails.body.alerts.budget).toBeTruthy();
    expect(projectDetails.body.alerts.budget.percentage).toBeGreaterThanOrEqual(50);

    // 7. Check notifications were created
    const notifications = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(notifications.body.length).toBeGreaterThan(0);
    expect(notifications.body[0].type).toBe('BUDGET_WARNING_50');

    // 8. Update milestone progress
    await request(app)
      .put(`/api/v1/milestones/${milestone1.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        completionPercentage: 75,
        status: 'IN_PROGRESS',
        actualHours: 90,
      })
      .expect(200);

    // 9. Get all projects summary
    const allProjects = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(allProjects.body).toHaveLength(1);
    expect(allProjects.body[0].calculations.profit).toBeLessThan(
      allProjects.body[0].calculations.remainingBudget
    );

    // 10. Mark notification as read
    const unreadCount1 = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(unreadCount1.body.count).toBeGreaterThan(0);

    await request(app)
      .put(`/api/v1/notifications/${notifications.body[0].id}/read`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const unreadCount2 = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(unreadCount2.body.count).toBe(unreadCount1.body.count - 1);
  });
});