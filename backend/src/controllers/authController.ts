import { Request, Response } from 'express';
import { authService } from '../services/authService.js';
import { AuthRequest } from '../types/index.js';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;
      const result = await authService.register(email, password, name);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  },

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const user = await authService.getUserProfile(userId);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },
};