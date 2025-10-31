import request from "supertest";
import app from "../../src/app.js";

describe("Auth Integration Tests", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "newuser@example.com",
          password: "password123",
          name: "New User",
        })
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user.email).toBe("newuser@example.com");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 400 for invalid email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "invalid-email",
          password: "password123",
          name: "Test User",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for short password", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "test@example.com",
          password: "123",
          name: "Test User",
        })
        .expect(400);

      expect(response.body.error).toContain("Validation failed");
    });

    it("should return 400 for duplicate email", async () => {
      await request(app).post("/api/v1/auth/register").send({
        email: "duplicate@example.com",
        password: "password123",
        name: "Test User",
      });

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "duplicate@example.com",
          password: "password123",
          name: "Test User",
        })
        .expect(400);

      expect(response.body.error).toContain("already exists");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });

    it("should login with correct credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should return 401 for wrong password", async () => {
      await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        })
        .expect(401);
    });

    it("should return 401 for non-existent user", async () => {
      await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        })
        .expect(401);
    });
  });

  describe("GET /api/v1/auth/profile", () => {
    let token: string;

    beforeEach(async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
      token = response.body.token;
    });

    it("should get profile with valid token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe("test@example.com");
      expect(response.body).not.toHaveProperty("password");
    });

    it("should return 401 without token", async () => {
      await request(app).get("/api/v1/auth/profile").expect(401);
    });

    it("should return 401 with invalid token", async () => {
      await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });
  });
});
