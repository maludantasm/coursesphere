import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let app: Awaited<typeof import("../src/app.js")>["app"];
let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "coursesphere-test-"));
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-secret-with-enough-length";
  process.env.DATA_FILE = join(tempDir, "db.json");

  const appModule = await import("../src/app.js");
  app = appModule.app;
});

afterAll(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

const register = async (email: string) => {
  const response = await request(app).post("/api/auth/register").send({
    name: "Test User",
    email,
    password: "Password123"
  });

  return response.body as { token: string; user: { id: string; email: string } };
};

describe("CourseSphere API", () => {
  it("registers, authenticates and creates a course with lessons", async () => {
    const session = await register("user@example.com");

    const courseResponse = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${session.token}`)
      .send({
        name: "React Avancado",
        description: "Componentes, rotas e consumo de API.",
        startDate: "2026-06-01",
        endDate: "2026-07-01"
      });

    expect(courseResponse.status).toBe(201);
    expect(courseResponse.body.data.creatorId).toBe(session.user.id);

    const lessonResponse = await request(app)
      .post(`/api/courses/${courseResponse.body.data.id}/lessons`)
      .set("Authorization", `Bearer ${session.token}`)
      .send({
        title: "Hooks e estado",
        status: "published",
        videoUrl: "https://example.com/hooks"
      });

    expect(lessonResponse.status).toBe(201);
    expect(lessonResponse.body.data.status).toBe("published");

    const listResponse = await request(app)
      .get(`/api/courses/${courseResponse.body.data.id}/lessons?status=published`)
      .set("Authorization", `Bearer ${session.token}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);
  });

  it("blocks updates from users that are not course creators", async () => {
    const owner = await register("owner@example.com");
    const guest = await register("guest@example.com");

    const courseResponse = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "Node Seguro",
        description: null,
        startDate: "2026-08-01",
        endDate: "2026-08-20"
      });

    const updateResponse = await request(app)
      .put(`/api/courses/${courseResponse.body.data.id}`)
      .set("Authorization", `Bearer ${guest.token}`)
      .send({ name: "Tentativa externa" });

    expect(updateResponse.status).toBe(403);
  });

  it("validates course date ranges", async () => {
    const session = await register("dates@example.com");

    const response = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${session.token}`)
      .send({
        name: "Datas invalidas",
        startDate: "2026-09-20",
        endDate: "2026-09-01"
      });

    expect(response.status).toBe(422);
  });
});
