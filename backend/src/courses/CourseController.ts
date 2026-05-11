import type { Request, Response } from "express";
import { requiredParam } from "../shared/http/routeParams.js";
import { createCourseSchema, type CourseService, updateCourseSchema } from "./CourseService.js";

export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  index = async (request: Request, response: Response) => {
    const courses = await this.courseService.list(String(request.query.search ?? ""));
    return response.json({ data: courses });
  };

  show = async (request: Request, response: Response) => {
    const course = await this.courseService.show(requiredParam(request.params.id, "id"));
    return response.json({ data: course });
  };

  create = async (request: Request, response: Response) => {
    const payload = createCourseSchema.parse(request.body);
    const course = await this.courseService.create(payload, request.user!.id);
    return response.status(201).json({ data: course });
  };

  update = async (request: Request, response: Response) => {
    const payload = updateCourseSchema.parse(request.body);
    const course = await this.courseService.update(requiredParam(request.params.id, "id"), payload, request.user!.id);
    return response.json({ data: course });
  };

  delete = async (request: Request, response: Response) => {
    await this.courseService.delete(requiredParam(request.params.id, "id"), request.user!.id);
    return response.status(204).send();
  };
}
