import { prisma } from "./testPrismaClient.ts"; // Import the clean client

// Since this file runs within the Jest environment, globals like 'beforeEach' are available.

// Example: Clear the database before each test to ensure test isolation
beforeEach(async () => {
  // Add logic to delete data from tables to reset the state.
  // await prisma.user.deleteMany();
  // You can also use $executeRaw for truncation if supported by your database:
  // await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE;`;
});

// Example: Any cleanup needed after all tests in a single file finish
afterAll(async () => {
  // Example: Reset specific global state or close a mock server.
});
