import { Router } from 'express';
import { milestoneController } from '../controllers/milestoneController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import {
  createMilestoneSchema,
  updateMilestoneSchema,
} from '../validations/milestoneValidation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Milestone CRUD
router.post(
  '/projects/:projectId/milestones',
  validate(createMilestoneSchema),
  milestoneController.createMilestone
);
router.get(
  '/projects/:projectId/milestones',
  milestoneController.getProjectMilestones
);
router.get('/milestones/:milestoneId', milestoneController.getMilestoneById);
router.put(
  '/milestones/:milestoneId',
  validate(updateMilestoneSchema),
  milestoneController.updateMilestone
);
router.delete('/milestones/:milestoneId', milestoneController.deleteMilestone);

export default router;