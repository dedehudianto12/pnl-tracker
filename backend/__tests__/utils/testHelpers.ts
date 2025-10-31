import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { generateToken } from "../../src/utils/jwt.js";
import { prisma } from "../testPrismaClient.ts";

export const createTestUser = async (overrides: any = {}) => {
  try {
    const password = await bcrypt.hash("testpass123", 10);
    return prisma.user.create({
      data: {
        email: overrides.email || faker.internet.email(),
        password,
        name: overrides.name || faker.person.fullName(),
        ...overrides,
      },
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    throw error;
  }
};

export const createTestProject = async (
  ownerId: string,
  overrides: any = {}
) => {
  return prisma.project.create({
    data: {
      ownerId,
      name: overrides.name || faker.company.name(),
      description: overrides.description || faker.lorem.sentence(),
      projectValue: overrides.projectValue || 50000,
      deadline: overrides.deadline || faker.date.future(),
      overheadPercentage: overrides.overheadPercentage ?? 10,
      currency: overrides.currency || "USD",
      ...overrides,
    },
  });
};

export const createTestExpense = async (
  projectId: string,
  overrides: any = {}
) => {
  return prisma.expense.create({
    data: {
      projectId,
      category: overrides.category || "MATERIALS",
      name: overrides.name || faker.commerce.productName(),
      estimatedCost: overrides.estimatedCost || 5000,
      actualCost: overrides.actualCost ?? 4500,
      isRecurring: overrides.isRecurring ?? false,
      ...overrides,
    },
  });
};

export const createTestMilestone = async (
  projectId: string,
  overrides: any = {}
) => {
  return prisma.milestone.create({
    data: {
      projectId,
      name: overrides.name || faker.lorem.words(3),
      targetDate: overrides.targetDate || faker.date.future(),
      completionPercentage: overrides.completionPercentage ?? 0,
      status: overrides.status || "PENDING",
      ...overrides,
    },
  });
};

export const generateAuthToken = (userId: string, email: string) => {
  return generateToken({ userId, email });
};

// Note: `prisma` is imported from `__tests__/setup.ts` to reuse the same PrismaClient
// instance that runs the test database setup/teardown. Do not create additional
// PrismaClient instances here to avoid extra DB connections and teardown issues.
