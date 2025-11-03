// __tests__/setup.ts
import { prisma } from "./testPrismaClient.js";

// Clear database before each test for isolation
beforeEach(async () => {
  // Delete in order to avoid foreign key constraint issues
  const tables = [
    "Notification",
    "Milestone",
    "Expense",
    "ProjectMember",
    "Project",
    "User",
  ];

  // Use transaction for faster cleanup
  await prisma.$transaction(
    tables.map((table) =>
      prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`
      )
    )
  );
});

// Disconnect after all tests in a file
afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
