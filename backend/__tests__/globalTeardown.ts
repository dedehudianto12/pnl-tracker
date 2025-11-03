// __tests__/globalTeardown.ts
import { PrismaClient } from "@prisma/client";

export default async function globalTeardown() {
  console.log("🧹 Running global teardown: Cleaning up resources.");

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    // Disconnect Prisma
    await prisma.$disconnect();
    console.log("✅ Prisma disconnected");
  } catch (error) {
    console.error("Error during globalTeardown:", error);
  }
}
