import crypto from "node:crypto";
import type { JsonDatabase } from "../database/JsonDatabase.js";
import type { LessonRecord, LessonStatus } from "../database/schema.js";

type CreateLessonInput = {
  title: string;
  status: LessonStatus;
  videoUrl?: string | null;
  courseId: string;
};

type UpdateLessonInput = Partial<Omit<CreateLessonInput, "courseId">>;

export class LessonRepository {
  constructor(private readonly database: JsonDatabase) {}

  async listByCourse(courseId: string, status?: LessonStatus) {
    const data = await this.database.read();

    return data.lessons
      .filter((lesson) => lesson.courseId === courseId)
      .filter((lesson) => !status || lesson.status === status)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async findById(id: string) {
    const data = await this.database.read();
    return data.lessons.find((lesson) => lesson.id === id) ?? null;
  }

  create(input: CreateLessonInput) {
    return this.database.transaction((data) => {
      const now = new Date().toISOString();
      const lesson: LessonRecord = {
        id: crypto.randomUUID(),
        title: input.title,
        status: input.status,
        videoUrl: input.videoUrl ?? null,
        courseId: input.courseId,
        createdAt: now,
        updatedAt: now
      };

      data.lessons.push(lesson);
      return lesson;
    });
  }

  update(id: string, input: UpdateLessonInput) {
    return this.database.transaction((data) => {
      const lesson = data.lessons.find((item) => item.id === id);

      if (!lesson) {
        return null;
      }

      lesson.title = input.title ?? lesson.title;
      lesson.status = input.status ?? lesson.status;
      lesson.videoUrl = input.videoUrl === undefined ? lesson.videoUrl : input.videoUrl;
      lesson.updatedAt = new Date().toISOString();

      return lesson;
    });
  }

  delete(id: string) {
    return this.database.transaction((data) => {
      const before = data.lessons.length;
      data.lessons = data.lessons.filter((lesson) => lesson.id !== id);
      return data.lessons.length < before;
    });
  }
}
