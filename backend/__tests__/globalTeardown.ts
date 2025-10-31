import { prisma } from "./testPrismaClient.ts"; // Import the clean client
import fs from "fs";

// The default export must be an async function.
export default async function globalTeardown() {
  console.log("🧹 Running global teardown: Cleaning up resources.");

  try {
    // Reuse your logic to find and drop test schemas (if you use this strategy)
    const schemaFiles = fs
      .readdirSync(process.cwd())
      .filter((f) => f.startsWith(".jest-test-schema-"));

    for (const file of schemaFiles) {
      const schema = fs.readFileSync(file, "utf-8").trim();
      await prisma.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schema}" CASCADE;`
      );
      console.log(`🧹 Dropped schema: ${schema}`);
      fs.unlinkSync(file);
    }
  } catch (error) {
    console.error("Error during globalTeardown cleanup:", error);
  } finally {
    // Crucial: Disconnect the shared Prisma client
    await prisma.$disconnect();
  }
}
