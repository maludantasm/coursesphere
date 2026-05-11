import { z } from "zod";
import type { CourseRepository } from "../courses/CourseRepository.js";
import type { LessonStatus } from "../database/schema.js";
import { AppError } from "../shared/errors/AppError.js";
import { presentLesson } from "./LessonPresenter.js";
import type { LessonRepository } from "./LessonRepository.js";

const videoUrlSchema = z.union([z.url(), z.literal(""), z.null()]).optional();

export const createLessonSchema = z.object({
  title: z.string().trim().min(3, "Title must contain at least 3 characters"),
  status: z.enum(["draft", "published"]).default("draft"),
  videoUrl: videoUrlSchema
});

export const updateLessonSchema = createLessonSchema.partial();

export class LessonService {
  constructor(
    private readonly lessons: LessonRepository,
    private readonly courses: CourseRepository
  ) {}

  async listByCourse(courseId: string, status?: LessonStatus) {
    await this.ensureCourseExists(courseId);
    const lessons = await this.lessons.listByCourse(courseId, status);
    return lessons.map(presentLesson);
  }

  async create(courseId: string, input: z.infer<typeof createLessonSchema>, userId: string) {
    const course = await this.ensureCourseExists(courseId);

    if (course.creatorId !== userId) {
      throw new AppError("Only the course creator can create lessons", 403);
    }

    const lesson = await this.lessons.create({
      courseId,
      title: input.title,
      status: input.status,
      videoUrl: input.videoUrl || null
    });

    return presentLesson(lesson);
  }

  async update(id: string, input: z.infer<typeof updateLessonSchema>, userId: string) {
    const lesson = await this.ensureLessonExists(id);
    const course = await this.ensureCourseExists(lesson.courseId);

    if (course.creatorId !== userId) {
      throw new AppError("Only the course creator can edit lessons", 403);
    }

    const updated = await this.lessons.update(id, {
      title: input.title,
      status: input.status,
      videoUrl: input.videoUrl === undefined ? undefined : input.videoUrl || null
    });

    if (!updated) {
      throw new AppError("Lesson not found", 404);
    }

    return presentLesson(updated);
  }

  async delete(id: string, userId: string) {
    const lesson = await this.ensureLessonExists(id);
    const course = await this.ensureCourseExists(lesson.courseId);

    if (course.creatorId !== userId) {
      throw new AppError("Only the course creator can delete lessons", 403);
    }

    await this.lessons.delete(id);
  }

  private async ensureCourseExists(courseId: string) {
    const course = await this.courses.findById(courseId);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    return course;
  }

  private async ensureLessonExists(id: string) {
    const lesson = await this.lessons.findById(id);

    if (!lesson) {
      throw new AppError("Lesson not found", 404);
    }

    return lesson;
  }
}
