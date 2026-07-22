import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";
import { SEED } from "./helpers";

describe("auth", () => {
  it("POST /auth/login succeeds with seeded admin credentials and returns a JWT", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: SEED.admin,
      password: SEED.password
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.token.split(".")).toHaveLength(3);
    expect(response.body.user).toMatchObject({
      email: SEED.admin,
      role: "ADMIN"
    });
  });

  it("POST /auth/login fails with wrong password (401)", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: SEED.admin,
      password: "wrong-password"
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("POST /auth/login fails with unknown email (401)", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "nobody@fundsweb.local",
      password: SEED.password
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});
