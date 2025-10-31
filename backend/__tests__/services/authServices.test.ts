import { authService } from "../../src/services/authService.js";
import { prisma } from "../testPrismaClient.js";
import bcrypt from "bcryptjs";

describe("AuthService", () => {
  describe("register", () => {
    it("should create a new user with hashed password", async () => {
      const result = await authService.register(
        "test@example.com",
        "password123",
        "Test User"
      );

      expect(result.user).toHaveProperty("id");
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.name).toBe("Test User");
      expect(result.token).toBeTruthy();

      // Verify password is hashed
      const user = await prisma.user.findUnique({
        where: { email: "test@example.com" },
      });
      expect(user?.password).not.toBe("password123");
      const isValid = await bcrypt.compare("password123", user!.password);
      expect(isValid).toBe(true);
    });

    it("should throw error if user already exists", async () => {
      await authService.register(
        "test@example.com",
        "password123",
        "Test User"
      );

      await expect(
        authService.register("test@example.com", "password123", "Test User")
      ).rejects.toThrow("User already exists");
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await authService.register(
        "test@example.com",
        "password123",
        "Test User"
      );
    });

    it("should login with correct credentials", async () => {
      const result = await authService.login("test@example.com", "password123");

      expect(result.user.email).toBe("test@example.com");
      expect(result.token).toBeTruthy();
    });

    it("should throw error with incorrect password", async () => {
      await expect(
        authService.login("test@example.com", "wrongpassword")
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw error with non-existent email", async () => {
      await expect(
        authService.login("nonexistent@example.com", "password123")
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("getUserProfile", () => {
    it("should return user profile", async () => {
      const { user } = await authService.register(
        "test@example.com",
        "password123",
        "Test User"
      );

      const profile = await authService.getUserProfile(user.id);

      expect(profile.id).toBe(user.id);
      expect(profile.email).toBe("test@example.com");
      expect(profile).not.toHaveProperty("password");
    });

    it("should throw error for non-existent user", async () => {
      await expect(
        authService.getUserProfile("nonexistent-id")
      ).rejects.toThrow("User not found");
    });
  });
});
