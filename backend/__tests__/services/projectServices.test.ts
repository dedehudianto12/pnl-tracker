import { projectService } from "../../src/services/projectService.js";
import { prisma } from "../testPrismaClient.js";
import { createTestUser, createTestProject } from "../utils/testHelpers.js";

describe("ProjectService", () => {
  let testUser: any;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe("createProject", () => {
    it("should create a new project", async () => {
      const projectData = {
        name: "Test Project",
        description: "Test Description",
        projectValue: 50000,
        deadline: "2025-12-31T00:00:00Z",
        overheadPercentage: 10,
        currency: "USD",
      };

      const project = await projectService.createProject(
        testUser.id,
        projectData
      );

      expect(project.name).toBe("Test Project");
      expect(project.ownerId).toBe(testUser.id);
      expect(Number(project.projectValue)).toBe(50000);
    });
  });

  describe("getUserProjects", () => {
    it("should return all projects owned by user", async () => {
      await createTestProject(testUser.id, { name: "Project 1" });
      await createTestProject(testUser.id, { name: "Project 2" });

      const projects = await projectService.getUserProjects(testUser.id);

      expect(projects).toHaveLength(2);
      expect(projects[0]).toHaveProperty("calculations");
    });

    it("should return projects where user is a member", async () => {
      const owner = await createTestUser();
      const project = await createTestProject(owner.id);

      // Add testUser as member
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: testUser.id,
          role: "MEMBER",
        },
      });

      const projects = await projectService.getUserProjects(testUser.id);

      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe(project.id);
    });
  });

  describe("getProjectById", () => {
    it("should return project with calculations and alerts", async () => {
      const project = await createTestProject(testUser.id, {
        projectValue: 100000,
      });

      // Add some expenses
      await prisma.expense.create({
        data: {
          projectId: project.id,
          category: "MATERIALS",
          name: "Test Expense",
          estimatedCost: 50000,
          actualCost: 45000,
        },
      });

      const result = await projectService.getProjectById(
        project.id,
        testUser.id
      );

      expect(result.id).toBe(project.id);
      expect(result).toHaveProperty("calculations");
      expect(result).toHaveProperty("alerts");
      expect(result.calculations.totalActualCost).toBe(45000);
    });

    it("should throw error for unauthorized access", async () => {
      const otherUser = await createTestUser();
      const project = await createTestProject(otherUser.id);

      await expect(
        projectService.getProjectById(project.id, testUser.id)
      ).rejects.toThrow("Project not found or access denied");
    });
  });

  describe("addMember", () => {
    it("should add member to project", async () => {
      const project = await createTestProject(testUser.id);
      const newMember = await createTestUser();

      const member = await projectService.addMember(
        project.id,
        testUser.id,
        newMember.email,
        "EDITOR"
      );

      expect(member.userId).toBe(newMember.id);
      expect(member.role).toBe("EDITOR");
    });

    it("should throw error if user not owner", async () => {
      const owner = await createTestUser();
      const project = await createTestProject(owner.id);
      const newMember = await createTestUser();

      await expect(
        projectService.addMember(
          project.id,
          testUser.id,
          newMember.email,
          "EDITOR"
        )
      ).rejects.toThrow("Project not found or you are not the owner");
    });

    it("should throw error if member already exists", async () => {
      const project = await createTestProject(testUser.id);
      const newMember = await createTestUser();

      await projectService.addMember(
        project.id,
        testUser.id,
        newMember.email,
        "EDITOR"
      );

      await expect(
        projectService.addMember(
          project.id,
          testUser.id,
          newMember.email,
          "EDITOR"
        )
      ).rejects.toThrow("User is already a member of this project");
    });
  });
});
