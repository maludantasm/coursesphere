import type { CourseRecord, UserRecord } from "../database/schema.js";
import { presentUser } from "../users/UserPresenter.js";

export const presentCourse = (course: CourseRecord, creator?: UserRecord | null) => ({
  id: course.id,
  name: course.name,
  description: course.description,
  startDate: course.startDate,
  endDate: course.endDate,
  creatorId: course.creatorId,
  creator: creator ? presentUser(creator) : null,
  createdAt: course.createdAt,
  updatedAt: course.updatedAt
});
