// __tests__/testPrismaClient.ts
import { PrismaClient } from "@prisma/client";

// Create a singleton Prisma client for tests
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.DEBUG ? ["query", "error", "warn"] : ["error"],
});

export { prisma };
