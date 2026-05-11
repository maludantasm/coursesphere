import type { ApiErrorBody, AuthSession, Course, CoursePayload, Lesson, LessonPayload, LessonStatus } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api";

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  register(payload: { name: string; email: string; password: string }) {
    return this.request<AuthSession>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  login(payload: { email: string; password: string }) {
    return this.request<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async listCourses(search: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const response = await this.request<{ data: Course[] }>(`/courses${query}`);
    return response.data;
  }

  async getCourse(id: string) {
    const response = await this.request<{ data: Course }>(`/courses/${id}`);
    return response.data;
  }

  async createCourse(payload: CoursePayload) {
    const response = await this.request<{ data: Course }>("/courses", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return response.data;
  }

  async updateCourse(id: string, payload: CoursePayload) {
    const response = await this.request<{ data: Course }>(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return response.data;
  }

  deleteCourse(id: string) {
    return this.request<void>(`/courses/${id}`, {
      method: "DELETE"
    });
  }

  async listLessons(courseId: string, status?: LessonStatus | "all") {
    const query = status && status !== "all" ? `?status=${status}` : "";
    const response = await this.request<{ data: Lesson[] }>(`/courses/${courseId}/lessons${query}`);
    return response.data;
  }

  async createLesson(courseId: string, payload: LessonPayload) {
    const response = await this.request<{ data: Lesson }>(`/courses/${courseId}/lessons`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return response.data;
  }

  async updateLesson(id: string, payload: LessonPayload) {
    const response = await this.request<{ data: Lesson }>(`/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    return response.data;
  }

  deleteLesson(id: string) {
    return this.request<void>(`/lessons/${id}`, {
      method: "DELETE"
    });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...init.headers
      }
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const body = (await response.json()) as T | ApiErrorBody;

    if (!response.ok) {
      const error = body as ApiErrorBody;
      throw new Error(formatApiError(error));
    }

    return body as T;
  }
}

export const formatApiError = (error: ApiErrorBody) => {
  if (Array.isArray(error.errors)) {
    const details = error.errors
      .map((item) => ("message" in item ? item.message : null))
      .filter(Boolean)
      .join(", ");

    return details || error.message;
  }

  return error.message || "Erro inesperado";
};

export const apiClient = new ApiClient();
