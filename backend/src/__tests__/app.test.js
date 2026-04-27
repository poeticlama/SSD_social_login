import request from "supertest";
import { createApp } from "../app.js";

describe("App routes", () => {
  test("GET /health returns service status", async () => {
    const app = createApp();

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      service: "ssd-social-login-backend"
    });
  });

  test("GET /api/auth/me without session returns 401", async () => {
    const app = createApp();

    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: "UNAUTHORIZED"
    });
  });

  test("GET /api/notes without session returns 401", async () => {
    const app = createApp();

    const res = await request(app).get("/api/notes");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: "UNAUTHORIZED"
    });
  });
});
