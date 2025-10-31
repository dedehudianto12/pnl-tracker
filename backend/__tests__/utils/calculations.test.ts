import {
  calculateBudgetAlert,
  calculateDeadlineAlert,
  calculateMilestoneAlerts,
} from '../../src/utils/alertCalculations.js';

describe('Alert Calculations', () => {
  describe('calculateBudgetAlert', () => {
    it('should return critical alert when budget exceeded', () => {
      const alert = calculateBudgetAlert(100000, 110000, 5000);
      
      expect(alert).not.toBeNull();
      expect(alert?.level).toBe('critical');
      expect(alert?.percentage).toBeGreaterThanOrEqual(100);
      expect(alert?.shouldNotify).toBe(true);
    });

    it('should return danger alert at 90% budget usage', () => {
      const alert = calculateBudgetAlert(100000, 90000, 0);
      
      expect(alert).not.toBeNull();
      expect(alert?.level).toBe('danger');
      expect(alert?.percentage).toBeGreaterThanOrEqual(90);
    });

    it('should return warning alert at 75% budget usage', () => {
      const alert = calculateBudgetAlert(100000, 75000, 0);
      
      expect(alert).not.toBeNull();
      expect(alert?.level).toBe('warning');
      expect(alert?.percentage).toBeGreaterThanOrEqual(75);
    });

    it('should return info alert at 50% budget usage', () => {
      const alert = calculateBudgetAlert(100000, 50000, 0);
      
      expect(alert).not.toBeNull();
      expect(alert?.level).toBe('info');
      expect(alert?.percentage).toBeGreaterThanOrEqual(50);
    });

    it('should return null when below 50% budget usage', () => {
      const alert = calculateBudgetAlert(100000, 40000, 0);
      expect(alert).toBeNull();
    });

    it('should include overhead in calculation', () => {
      const alert = calculateBudgetAlert(100000, 70000, 10000);
      
      expect(alert).not.toBeNull();
      expect(alert?.percentage).toBe(80); // (70000 + 10000) / 100000
    });
  });

  describe('calculateDeadlineAlert', () => {
    it('should detect overdue project', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      
      const alert = calculateDeadlineAlert(pastDate);
      
      expect(alert.isOverdue).toBe(true);
      expect(alert.daysRemaining).toBeLessThan(0);
      expect(alert.message).toContain('overdue');
    });

    it('should warn for approaching deadline', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      const alert = calculateDeadlineAlert(futureDate);
      
      expect(alert.isOverdue).toBe(false);
      expect(alert.daysRemaining).toBeLessThanOrEqual(7);
      expect(alert.message).toContain('approaching');
    });

    it('should calculate days remaining correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      const alert = calculateDeadlineAlert(futureDate);
      
      expect(alert.daysRemaining).toBeGreaterThan(25);
      expect(alert.daysRemaining).toBeLessThanOrEqual(31);
    });
  });

  describe('calculateMilestoneAlerts', () => {
    it('should count delayed milestones', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      
      const milestones = [
        {
          id: '1',
          projectId: 'proj1',
          name: 'Test',
          description: null,
          targetDate: pastDate,
          completionPercentage: 50,
          status: 'IN_PROGRESS' as const,
          estimatedHours: null,
          actualHours: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      const alert = calculateMilestoneAlerts(milestones);
      
      expect(alert.delayed).toBe(1);
      expect(alert.message).toContain('delayed');
    });

    it('should not count completed milestones as delayed', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      
      const milestones = [
        {
          id: '1',
          projectId: 'proj1',
          name: 'Test',
          description: null,
          targetDate: pastDate,
          completionPercentage: 100,
          status: 'COMPLETED' as const,
          estimatedHours: null,
          actualHours: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      
      const alert = calculateMilestoneAlerts(milestones);
      
      expect(alert.delayed).toBe(0);
      expect(alert.message).toContain('on track');
    });
  });
});