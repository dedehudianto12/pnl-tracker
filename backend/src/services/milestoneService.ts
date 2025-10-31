import prisma from '../config/database.js';
import { MilestoneStatus, Prisma } from '@prisma/client';

export const milestoneService = {
  async createMilestone(
    projectId: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      targetDate: string;
      completionPercentage?: number;
      status?: MilestoneStatus;
      estimatedHours?: number;
      actualHours?: number;
    }
  ) {
    // Check if user has access to project
    const hasAccess = await this.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      throw new Error('Project not found or access denied');
    }

    const milestone = await prisma.milestone.create({
      data: {
        ...data,
        projectId,
        targetDate: new Date(data.targetDate),
      },
    });

    return milestone;
  },

  async getProjectMilestones(projectId: string, userId: string) {
    // Check access
    const hasAccess = await this.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      throw new Error('Project not found or access denied');
    }

    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { targetDate: 'asc' },
    });

    // Calculate overall progress
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(
      (m) => m.status === 'COMPLETED'
    ).length;
    const overallProgress =
      totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

    const avgCompletion =
      totalMilestones > 0
        ? Math.round(
            milestones.reduce((sum, m) => sum + m.completionPercentage, 0) /
              totalMilestones
          )
        : 0;

    return {
      milestones,
      summary: {
        total: totalMilestones,
        completed: completedMilestones,
        overallProgress,
        avgCompletion,
      },
    };
  },

  async getMilestoneById(milestoneId: string, userId: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { project: true },
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    const hasAccess = await this.checkProjectAccess(milestone.projectId, userId);
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    return milestone;
  },

  async updateMilestone(
    milestoneId: string,
    userId: string,
    data: Partial<{
      name: string;
      description: string;
      targetDate: string;
      completionPercentage: number;
      status: MilestoneStatus;
      estimatedHours: number;
      actualHours: number;
    }>
  ) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    // Check if user can edit
    const canEdit = await this.checkEditPermission(milestone.projectId, userId);
    if (!canEdit) {
      throw new Error('Insufficient permissions');
    }

    const updateData: Prisma.MilestoneUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.targetDate) updateData.targetDate = new Date(data.targetDate);
    if (data.completionPercentage !== undefined)
      updateData.completionPercentage = data.completionPercentage;
    if (data.status) updateData.status = data.status;
    if (data.estimatedHours !== undefined)
      updateData.estimatedHours = data.estimatedHours;
    if (data.actualHours !== undefined) updateData.actualHours = data.actualHours;

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    return updatedMilestone;
  },

  async deleteMilestone(milestoneId: string, userId: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      throw new Error('Milestone not found');
    }

    // Check if user can delete
    const canEdit = await this.checkEditPermission(milestone.projectId, userId);
    if (!canEdit) {
      throw new Error('Insufficient permissions');
    }

    await prisma.milestone.delete({ where: { id: milestoneId } });
    return { message: 'Milestone deleted successfully' };
  },

  // Helper methods
  async checkProjectAccess(projectId: string, userId: string): Promise<boolean> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });
    return !!project;
  },

  async checkEditPermission(projectId: string, userId: string): Promise<boolean> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId, role: { in: ['EDITOR', 'MEMBER'] } } } },
        ],
      },
    });
    return !!project;
  },
};