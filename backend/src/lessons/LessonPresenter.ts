import type { LessonRecord } from "../database/schema.js";

export const presentLesson = (lesson: LessonRecord) => ({
  id: lesson.id,
  title: lesson.title,
  status: lesson.status,
  videoUrl: lesson.videoUrl,
  courseId: lesson.courseId,
  createdAt: lesson.createdAt,
  updatedAt: lesson.updatedAt
});
