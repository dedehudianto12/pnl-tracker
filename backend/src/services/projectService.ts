import prisma from "../config/database.js";
import { ProjectStatus, MemberRole, Prisma } from "@prisma/client";
import { calculateProjectMetrics } from "../utils/calculations.js";
import { generateProjectAlerts } from "../utils/alertCalculations.js";
import { notificationService } from "./notificationService.js";

export const projectService = {
  async createProject(
    userId: string,
    data: {
      name: string;
      description?: string;
      projectValue: number;
      deadline: string;
      overheadPercentage?: number;
      currency?: string;
    }
  ) {
    const project = await prisma.project.create({
      data: {
        ...data,
        deadline: new Date(data.deadline),
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return project;
  },

  async getUserProjects(userId: string) {
    // Get projects where user is owner or member
    const projects = await prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        expenses: true,
        milestones: true,
        _count: {
          select: {
            expenses: true,
            milestones: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate metrics for each project
    const projectsWithMetrics = projects.map((project) => ({
      ...project,
      calculations: calculateProjectMetrics(project, project.expenses),
    }));

    return projectsWithMetrics;
  },

  async getProjectById(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        expenses: {
          orderBy: { createdAt: "desc" },
        },
        milestones: {
          orderBy: { targetDate: "asc" },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found or access denied");
    }

    const calculations = calculateProjectMetrics(project, project.expenses);
    const alerts = generateProjectAlerts(
      project,
      calculations.totalActualCost,
      calculations.overheadCost
    );

    // Create notification if budget warning threshold crossed
    if (alerts.budget && alerts.budget.shouldNotify) {
      await notificationService.checkAndCreateBudgetWarnings(
        project.id,
        project.ownerId,
        alerts.budget.percentage,
        project.name
      );
    }

    return { ...project, calculations, alerts };
  },

  async updateProject(
    projectId: string,
    userId: string,
    data: Partial<{
      name: string;
      description: string;
      projectValue: number;
      deadline: string;
      overheadPercentage: number;
      status: ProjectStatus;
    }>
  ) {
    // Check if user is owner or editor
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId, role: { in: ["EDITOR"] } } } },
        ],
      },
    });

    if (!project) {
      throw new Error("Project not found or insufficient permissions");
    }

    const updateData: Prisma.ProjectUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.projectValue) updateData.projectValue = data.projectValue;
    if (data.deadline) updateData.deadline = new Date(data.deadline);
    if (data.overheadPercentage !== undefined)
      updateData.overheadPercentage = data.overheadPercentage;
    if (data.status) updateData.status = data.status;

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return updatedProject;
  },

  async deleteProject(projectId: string, userId: string) {
    // Only owner can delete
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      throw new Error("Project not found or you are not the owner");
    }

    await prisma.project.delete({ where: { id: projectId } });
    return { message: "Project deleted successfully" };
  },

  async addMember(
    projectId: string,
    ownerId: string,
    memberEmail: string,
    role: MemberRole
  ) {
    // Check if user is owner
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId },
    });

    if (!project) {
      throw new Error("Project not found or you are not the owner");
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: memberEmail },
    });
    if (!user) {
      throw new Error("User not found");
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this project");
    }

    // Add member
    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return member;
  },

  async removeMember(projectId: string, ownerId: string, memberId: string) {
    // Check if user is owner
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId },
    });

    if (!project) {
      throw new Error("Project not found or you are not the owner");
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
    });

    return { message: "Member removed successfully" };
  },

  async updateMemberRole(
    projectId: string,
    ownerId: string,
    memberId: string,
    role: MemberRole
  ) {
    // Check if user is owner
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId },
    });

    if (!project) {
      throw new Error("Project not found or you are not the owner");
    }

    const updatedMember = await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return updatedMember;
  },
};
