import crypto from "node:crypto";
import type { JsonDatabase } from "../database/JsonDatabase.js";
import type { CourseRecord } from "../database/schema.js";

type CreateCourseInput = {
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  creatorId: string;
};

type UpdateCourseInput = Partial<Omit<CreateCourseInput, "creatorId">>;

export class CourseRepository {
  constructor(private readonly database: JsonDatabase) {}

  async list(search?: string) {
    const data = await this.database.read();
    const normalizedSearch = search?.trim().toLowerCase();

    return data.courses
      .filter((course) => !normalizedSearch || course.name.toLowerCase().includes(normalizedSearch))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findById(id: string) {
    const data = await this.database.read();
    return data.courses.find((course) => course.id === id) ?? null;
  }

  create(input: CreateCourseInput) {
    return this.database.transaction((data) => {
      const now = new Date().toISOString();
      const course: CourseRecord = {
        id: crypto.randomUUID(),
        name: input.name,
        description: input.description ?? null,
        startDate: input.startDate,
        endDate: input.endDate,
        creatorId: input.creatorId,
        createdAt: now,
        updatedAt: now
      };

      data.courses.push(course);
      return course;
    });
  }

  update(id: string, input: UpdateCourseInput) {
    return this.database.transaction((data) => {
      const course = data.courses.find((item) => item.id === id);

      if (!course) {
        return null;
      }

      course.name = input.name ?? course.name;
      course.description = input.description === undefined ? course.description : input.description;
      course.startDate = input.startDate ?? course.startDate;
      course.endDate = input.endDate ?? course.endDate;
      course.updatedAt = new Date().toISOString();

      return course;
    });
  }

  delete(id: string) {
    return this.database.transaction((data) => {
      const before = data.courses.length;
      data.courses = data.courses.filter((course) => course.id !== id);
      data.lessons = data.lessons.filter((lesson) => lesson.courseId !== id);

      return data.courses.length < before;
    });
  }
}
