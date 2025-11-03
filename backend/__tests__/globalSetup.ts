// __tests__/globalSetup.ts
import * as dotenv from "dotenv";
import * as path from "path";
import { execSync } from "child_process";

export default async function globalSetup() {
  console.log("🛠️ Running global setup: Loading ENV and preparing database.");

  // Load test environment variables
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

  // Verify we're using test database
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl?.includes("test")) {
    throw new Error(
      '⚠️  DATABASE_URL must contain "test" to prevent accidental production DB usage!'
    );
  }

  console.log(`📦 Using database: ${dbUrl?.split("@")[1]}`);

  try {
    // Push Prisma schema to test database
    console.log("🔄 Pushing Prisma schema...");
    execSync("npx prisma db push --force-reset --skip-generate", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
    console.log("✅ Database schema ready");
  } catch (error) {
    console.error("❌ Failed to setup database:", error);
    throw error;
  }
}
