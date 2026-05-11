import { z } from "zod";
import { AppError } from "../shared/errors/AppError.js";
import { presentCourse } from "./CoursePresenter.js";
import type { CourseRepository } from "./CourseRepository.js";
import type { UserRepository } from "../users/UserRepository.js";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");

const courseShapeSchema = z.object({
  name: z.string().trim().min(3, "Name must contain at least 3 characters"),
  description: z.string().trim().optional().nullable(),
  startDate: isoDate,
  endDate: isoDate
});

export const createCourseSchema = courseShapeSchema.refine((course) => course.endDate >= course.startDate, {
  path: ["endDate"],
  message: "End date must be equal to or after start date"
});

export const updateCourseSchema = courseShapeSchema.partial().refine(
  (course) => {
    if (!course.startDate || !course.endDate) {
      return true;
    }

    return course.endDate >= course.startDate;
  },
  {
    path: ["endDate"],
    message: "End date must be equal to or after start date"
  }
);

export class CourseService {
  constructor(
    private readonly courses: CourseRepository,
    private readonly users: UserRepository
  ) {}

  async list(search?: string) {
    const courses = await this.courses.list(search);
    return Promise.all(courses.map((course) => this.withCreator(course)));
  }

  async show(id: string) {
    const course = await this.courses.findById(id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    return this.withCreator(course);
  }

  async create(input: z.infer<typeof createCourseSchema>, userId: string) {
    const course = await this.courses.create({
      ...input,
      description: input.description || null,
      creatorId: userId
    });

    return this.withCreator(course);
  }

  async update(id: string, input: z.infer<typeof updateCourseSchema>, userId: string) {
    const currentCourse = await this.courses.findById(id);

    if (!currentCourse) {
      throw new AppError("Course not found", 404);
    }

    if (currentCourse.creatorId !== userId) {
      throw new AppError("Only the creator can edit this course", 403);
    }

    const nextStartDate = input.startDate ?? currentCourse.startDate;
    const nextEndDate = input.endDate ?? currentCourse.endDate;

    if (nextEndDate < nextStartDate) {
      throw new AppError("End date must be equal to or after start date", 422);
    }

    const updated = await this.courses.update(id, {
      ...input,
      description: input.description === undefined ? undefined : input.description || null
    });

    if (!updated) {
      throw new AppError("Course not found", 404);
    }

    return this.withCreator(updated);
  }

  async delete(id: string, userId: string) {
    const course = await this.courses.findById(id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    if (course.creatorId !== userId) {
      throw new AppError("Only the creator can delete this course", 403);
    }

    await this.courses.delete(id);
  }

  private async withCreator(course: Awaited<ReturnType<CourseRepository["findById"]>> extends infer C ? NonNullable<C> : never) {
    const creator = await this.users.findById(course.creatorId);
    return presentCourse(course, creator);
  }
}
