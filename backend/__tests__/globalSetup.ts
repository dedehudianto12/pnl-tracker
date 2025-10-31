import * as dotenv from "dotenv";
import * as path from "path";
import { prisma } from "./testPrismaClient.ts"; // Import the clean client

// The default export must be an async function.
export default async function globalSetup() {
  console.log("🛠️ Running global setup: Loading ENV and preparing database.");

  // 1. Load test environment variables (e.g., DATABASE_URL)
  // Assumes you have a separate .env.test file for your test database.
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

  // 2. Add your database setup logic here (e.g., run migrations or schema push)
  // await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS "test_schema"`;

  // Ensure the connection is closed after setup
  await prisma.$disconnect();
}
