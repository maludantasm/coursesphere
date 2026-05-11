export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthSession = {
  token: string;
  user: User;
};

export type Course = {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  creatorId: string;
  creator: User | null;
  createdAt: string;
  updatedAt: string;
};

export type LessonStatus = "draft" | "published";

export type Lesson = {
  id: string;
  title: string;
  status: LessonStatus;
  videoUrl: string | null;
  courseId: string;
  createdAt: string;
  updatedAt: string;
};

export type CoursePayload = {
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
};

export type LessonPayload = {
  title: string;
  status: LessonStatus;
  videoUrl: string | null;
};

export type ApiErrorBody = {
  message: string;
  errors?: Array<{ path: string; message: string }> | unknown;
};
