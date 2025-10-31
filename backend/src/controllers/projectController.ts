import { Response } from 'express';
import { projectService } from '../services/projectService.js';
import { AuthRequest } from '../types/index.js';

export const projectController = {
  async createProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const project = await projectService.createProject(userId, req.body);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async getUserProjects(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const projects = await projectService.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getProjectById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { projectId } = req.params;
      const project = await projectService.getProjectById(projectId, userId);
      res.json(project);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },

  async updateProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { projectId } = req.params;
      const project = await projectService.updateProject(
        projectId,
        userId,
        req.body
      );
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async deleteProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { projectId } = req.params;
      const result = await projectService.deleteProject(projectId, userId);
      res.json(result);
    } catch (error) {
      res.status(403).json({ error: (error as Error).message });
    }
  },

  async addMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { projectId } = req.params;
      const { email, role } = req.body;
      const member = await projectService.addMember(
        projectId,
        userId,
        email,
        role
      );
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async removeMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { projectId, memberId } = req.params;
      const result = await projectService.removeMember(
        projectId,
        userId,
        memberId
      );
      res.json(result);
    } catch (error) {
      res.status(403).json({ error: (error as Error).message });
    }
  },

  async updateMemberRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { projectId, memberId } = req.params;
      const { role } = req.body;
      const member = await projectService.updateMemberRole(
        projectId,
        userId,
        memberId,
        role
      );
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
};