import type { Request, Response } from "express";
import { z } from "zod";
import type { LessonStatus } from "../database/schema.js";
import { requiredParam } from "../shared/http/routeParams.js";
import { createLessonSchema, type LessonService, updateLessonSchema } from "./LessonService.js";

const lessonStatusQuerySchema = z.object({
  status: z.enum(["draft", "published"]).optional()
});

export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  index = async (request: Request, response: Response) => {
    const { status } = lessonStatusQuerySchema.parse(request.query);
    const lessons = await this.lessonService.listByCourse(requiredParam(request.params.courseId, "courseId"), status as LessonStatus | undefined);
    return response.json({ data: lessons });
  };

  create = async (request: Request, response: Response) => {
    const payload = createLessonSchema.parse(request.body);
    const lesson = await this.lessonService.create(requiredParam(request.params.courseId, "courseId"), payload, request.user!.id);
    return response.status(201).json({ data: lesson });
  };

  update = async (request: Request, response: Response) => {
    const payload = updateLessonSchema.parse(request.body);
    const lesson = await this.lessonService.update(requiredParam(request.params.id, "id"), payload, request.user!.id);
    return response.json({ data: lesson });
  };

  delete = async (request: Request, response: Response) => {
    await this.lessonService.delete(requiredParam(request.params.id, "id"), request.user!.id);
    return response.status(204).send();
  };
}
