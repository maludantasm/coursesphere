export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseRecord = {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
};

export type LessonStatus = "draft" | "published";

export type LessonRecord = {
  id: string;
  title: string;
  status: LessonStatus;
  videoUrl: string | null;
  courseId: string;
  createdAt: string;
  updatedAt: string;
};

export type DatabaseSchema = {
  users: UserRecord[];
  courses: CourseRecord[];
  lessons: LessonRecord[];
};

export const createEmptyDatabase = (): DatabaseSchema => ({
  users: [],
  courses: [],
  lessons: []
});
