import app from "./app.js";
import prisma from "./config/database.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      const isProduction = process.env.NODE_ENV === "production";
      const baseUrl = isProduction
        ? process.env.APP_URL || "https://pnl-tracker.up.railway.app"
        : `http://localhost:${PORT}`;

      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `🌍 Environment: ${isProduction ? "Production" : "Development"}`
      );
      console.log(`📍 Health check: ${baseUrl}/health`);
      console.log(`🔐 API Base URL: ${baseUrl}/api/v1`);

      if (!isProduction) {
        console.log(`💡 Local development mode`);
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
