import { Router } from 'express';
import { projectController } from '../controllers/projectController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from '../validations/projectValidation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Project CRUD
router.post('/', validate(createProjectSchema), projectController.createProject);
router.get('/', projectController.getUserProjects);
router.get('/:projectId', projectController.getProjectById);
router.put(
  '/:projectId',
  validate(updateProjectSchema),
  projectController.updateProject
);
router.delete('/:projectId', projectController.deleteProject);

// Member management
router.post(
  '/:projectId/members',
  validate(addMemberSchema),
  projectController.addMember
);
router.delete('/:projectId/members/:memberId', projectController.removeMember);
router.put('/:projectId/members/:memberId', projectController.updateMemberRole);

export default router;