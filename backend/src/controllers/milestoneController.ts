import { milestoneService } from '../services/milestoneService.js';
import { AuthRequest } from '../types/index.js';
import { Response } from 'express';

export const milestoneController = {
  async createMilestone(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { projectId } = req.params;
      const milestone = await milestoneService.createMilestone(
        projectId,
        userId,
        req.body
      );
      res.status(201).json(milestone);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async getProjectMilestones(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { projectId } = req.params;
      const result = await milestoneService.getProjectMilestones(
        projectId,
        userId
      );
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },

  async getMilestoneById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { milestoneId } = req.params;
      const milestone = await milestoneService.getMilestoneById(
        milestoneId,
        userId
      );
      res.json(milestone);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },

  async updateMilestone(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { milestoneId } = req.params;
      const milestone = await milestoneService.updateMilestone(
        milestoneId,
        userId,
        req.body
      );
      res.json(milestone);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async deleteMilestone(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { milestoneId } = req.params;
      const result = await milestoneService.deleteMilestone(milestoneId, userId);
      res.json(result);
    } catch (error) {
      res.status(403).json({ error: (error as Error).message });
    }
  },
};