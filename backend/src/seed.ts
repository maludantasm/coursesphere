import { database } from "./database/database.js";
import { CourseRepository } from "./courses/CourseRepository.js";
import { LessonRepository } from "./lessons/LessonRepository.js";
import { PasswordHasher } from "./shared/security/passwordHasher.js";
import { UserRepository } from "./users/UserRepository.js";

const users = new UserRepository(database);
const courses = new CourseRepository(database);
const lessons = new LessonRepository(database);
const hasher = new PasswordHasher();

const main = async () => {
  const existing = await users.findByEmail("demo@coursesphere.dev");

  if (existing) {
    console.log("Seed user already exists: demo@coursesphere.dev / Password123");
    return;
  }

  const user = await users.create({
    name: "Demo User",
    email: "demo@coursesphere.dev",
    passwordHash: await hasher.hash("Password123")
  });

  const course = await courses.create({
    name: "Introdução ao Full Stack",
    description: "Curso de exemplo para validar o fluxo de cursos e aulas",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    creatorId: user.id
  });

  await lessons.create({
    courseId: course.id,
    title: "Visão geral da arquitetura",
    status: "published",
    videoUrl: "https://example.com/full-stack-intro"
  });

  await lessons.create({
    courseId: course.id,
    title: "Planejamento do frontend",
    status: "draft",
    videoUrl: null
  });

  console.log("Seed completed: demo@coursesphere.dev / Password123");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
