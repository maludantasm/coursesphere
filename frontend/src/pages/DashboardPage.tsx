import { ArrowUpRight, BookOpen, ChevronDown, ChevronLeft, ChevronRight, Filter, MoreHorizontal, Plus, Search, SlidersHorizontal, UsersRound, Video } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/ApiClient";
import type { Course, Lesson } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { Loading } from "../components/Loading";

type CourseWithLessons = Course & {
  lessons?: Lesson[];
};

const cardSkins = ["teal", "green", "violet", "rose", "blue", "cyan"];

export const DashboardPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseWithLessons[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        const courseList = await apiClient.listCourses(search);
        const coursesWithLessons = await Promise.all(
          courseList.map(async (course) => ({
            ...course,
            lessons: await apiClient.listLessons(course.id).catch(() => [])
          }))
        );

        setCourses(coursesWithLessons);
        setError(null);
      } catch (requestError) {
        setError((requestError as Error).message);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const publishedLessons = courses.reduce((total, course) => total + (course.lessons?.filter((lesson) => lesson.status === "published").length ?? 0), 0);
  const totalLessons = courses.reduce((total, course) => total + (course.lessons?.length ?? 0), 0);
  const completionAverage = courses.length
    ? Math.round(courses.reduce((total, course, index) => total + getCourseProgress(course, index), 0) / courses.length)
    : 0;

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <h1>Olá, {user?.name ?? "Demo User"}! <span aria-hidden="true">👋</span></h1>
          <p>Aqui estão os seus cursos e aulas</p>
        </div>

        <Link className="button" to="/courses/new">
          <Plus size={18} />
          Novo curso
        </Link>
      </div>

      <div className="dashboard-toolbar">
        <label className="dashboard-search">
          <Search size={19} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome do curso..." />
        </label>

        <button className="dashboard-filter" type="button">
          <Filter size={18} />
          Filtro
          <ChevronDown size={15} />
        </button>

        <button className="dashboard-filter" type="button">
          <SlidersHorizontal size={18} />
          Mais recentes
          <ChevronDown size={15} />
        </button>
      </div>

      <div className="metrics-panel">
        <MetricCard icon={<BookOpen size={21} />} value={courses.length} label="Cursos ativos" tone="purple" />
        <MetricCard icon={<Video size={21} />} value={publishedLessons} label="Aulas publicadas" tone="violet" />
        <MetricCard icon={<UsersRound size={21} />} value={Math.max(0, courses.length * 42)} label="Alunos" tone="orange" />
        <MetricCard icon={<ArrowUpRight size={21} />} value={`${completionAverage}%`} label="Taxa de conclusão média" tone="blue" />
      </div>

      {isLoading ? <Loading /> : null}
      {error ? <div className="form-error">{error}</div> : null}

      {!isLoading && !courses.length ? <div className="empty-state">Nenhum curso encontrado.</div> : null}

      <div className="dashboard-course-grid">
        {courses.map((course, index) => {
          const progress = getCourseProgress(course, index);
          const lessonsCount = course.lessons?.length ?? 0;
          const skin = getStableCourseSkin(course.id);
          const status = getCourseStatus(course, index);

          return (
            <Link className="dashboard-course-card" key={course.id} to={`/courses/${course.id}`}>
              <div className={`course-cover ${skin}`}>
                <span>{status}</span>
              </div>

              <div className="dashboard-course-body">
                <h2>{course.name}</h2>
                <p>{course.description || "Sem descricao cadastrada."}</p>

                <strong>{progress}% concluído</strong>
                <div className="progress-track">
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="dashboard-course-footer">
                <span className="mini-avatar">{getInitials(course.creator?.name ?? user?.name ?? "DU")}</span>
                <span>Atualizado em {formatDate(course.updatedAt.slice(0, 10))}</span>
                <span>{lessonsCount || totalLessons || 0} aulas</span>
                <MoreHorizontal size={20} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="dashboard-pagination" aria-label="Paginação">
        <button type="button" aria-label="Página anterior">
          <ChevronLeft size={18} />
        </button>
        <button className="active" type="button">
          1
        </button>
        <button type="button" aria-label="Próxima página">
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
};

export const formatDate = (value: string) => {
  const dateOnly = value.includes("T") ? value.slice(0, 10) : value;
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${dateOnly}T00:00:00Z`));
};

const MetricCard = ({ icon, value, label, tone }: { icon: ReactNode; value: string | number; label: string; tone: string }) => (
  <article className="metric-card">
    <span className={`metric-icon ${tone}`}>{icon}</span>
    <div>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  </article>
);

const getCourseProgress = (course: CourseWithLessons, index: number) => {
  const published = course.lessons?.filter((lesson) => lesson.status === "published").length ?? 0;
  const total = course.lessons?.length ?? 0;

  if (total > 0) {
    return Math.max(10, Math.round((published / total) * 100));
  }

  return [75, 60, 40, 25, 90, 30][index % 6];
};

const getCourseStatus = (course: CourseWithLessons, index: number) => {
  const today = new Date().toISOString().slice(0, 10);

  if (course.startDate > today) {
    return "Rascunho";
  }

  return index % 3 === 2 ? "Em andamento" : "Publicado";
};

const getStableCourseSkin = (courseId: string) => {
  const hash = courseId.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return cardSkins[hash % cardSkins.length];
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
