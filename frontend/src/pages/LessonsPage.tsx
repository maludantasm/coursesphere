import { ArrowLeft, BookOpen, CalendarDays, CheckCircle2, Clock3, ExternalLink, FileVideo, Plus, Search, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/ApiClient";
import type { Course, Lesson, LessonStatus } from "../api/types";
import { Loading } from "../components/Loading";
import { formatDate } from "./DashboardPage";

type LessonWithCourse = Lesson & {
  course: Course;
};

export const LessonsPage = () => {
  const [lessons, setLessons] = useState<LessonWithCourse[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LessonStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLessons = async () => {
      const courses = await apiClient.listCourses("");
      const lessonsByCourse = await Promise.all(
        courses.map(async (course) => {
          const courseLessons = await apiClient.listLessons(course.id).catch(() => []);
          return courseLessons.map((lesson) => ({ ...lesson, course }));
        })
      );

      setLessons(lessonsByCourse.flat());
    };

    loadLessons()
      .then(() => setError(null))
      .catch((requestError) => setError((requestError as Error).message))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredLessons = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return lessons
      .filter((lesson) => statusFilter === "all" || lesson.status === statusFilter)
      .filter((lesson) => {
        if (!normalizedSearch) {
          return true;
        }

        return lesson.title.toLowerCase().includes(normalizedSearch) || lesson.course.name.toLowerCase().includes(normalizedSearch);
      });
  }, [lessons, search, statusFilter]);

  const publishedCount = lessons.filter((lesson) => lesson.status === "published").length;
  const draftCount = lessons.filter((lesson) => lesson.status === "draft").length;
  const coursesWithLessons = new Set(lessons.map((lesson) => lesson.courseId)).size;

  return (
    <section className="lessons-page">
      <header className="lessons-header">
        <div className="calendar-title-group">
          <Link className="back-home-button" to="/">
            <ArrowLeft size={22} />
            <span>Voltar para cursos</span>
          </Link>
          <div>
            <span className="calendar-eyebrow">
              <Video size={18} />
              Aulas
            </span>
            <h1>Biblioteca de aulas</h1>
            <p>Gerencie aulas publicadas, rascunhos e conteúdos vinculados aos seus cursos</p>
          </div>
        </div>

        <Link className="button calendar-new-course" to="/">
          Nova aula
          <Plus size={18} />
        </Link>
      </header>

      <div className="lessons-metrics">
        <LessonMetric icon={<FileVideo size={23} />} value={lessons.length} label="Aulas cadastradas" />
        <LessonMetric icon={<CheckCircle2 size={23} />} value={publishedCount} label="Publicadas" />
        <LessonMetric icon={<Clock3 size={23} />} value={draftCount} label="Rascunhos" />
        <LessonMetric icon={<BookOpen size={23} />} value={coursesWithLessons} label="Cursos com aulas" />
      </div>

      <div className="lessons-toolbar">
        <label className="dashboard-search">
          <Search size={19} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar aula ou curso..." />
        </label>
        <label className="dashboard-filter lesson-status-filter">
          <Video size={17} />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as LessonStatus | "all")}>
            <option value="all">Todos os status</option>
            <option value="published">Publicadas</option>
            <option value="draft">Rascunhos</option>
          </select>
        </label>
      </div>

      {isLoading ? <Loading /> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="lessons-layout">
        <section className="lessons-list-panel">
          {filteredLessons.map((lesson, index) => (
            <article className="lesson-library-row" key={lesson.id}>
              <div className="lesson-thumbnail">
                <Video size={24} />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>

              <div className="lesson-library-content">
                <div>
                  <h2>{lesson.title}</h2>
                  <span className={`status ${lesson.status}`}>{lesson.status === "draft" ? "Rascunho" : "Publicado"}</span>
                </div>
                <p>
                  {lesson.course.name}
                  <span aria-hidden="true">•</span>
                  Atualizada em {formatDate(lesson.updatedAt)}
                </p>
              </div>

              <div className="lesson-library-actions">
                {lesson.videoUrl ? (
                  <a href={lesson.videoUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} />
                    Ver vídeo
                  </a>
                ) : null}
                <Link to={`/courses/${lesson.courseId}`}>
                  <BookOpen size={16} />
                  Abrir curso
                </Link>
              </div>
            </article>
          ))}

          {!filteredLessons.length && !isLoading ? (
            <div className="course-empty-lessons">
              <Video size={94} />
              <h2>Nenhuma aula encontrada</h2>
              <p>Abra um curso para cadastrar a primeira aula ou ajuste os filtros usados na busca.</p>
              <Link className="button course-primary-action" to="/">
                Ver cursos
              </Link>
            </div>
          ) : null}
        </section>

        <aside className="lessons-side-panel">
          <section>
            <h2>Fluxo recomendado</h2>
            <ul>
              <li>
                <CheckCircle2 size={18} />
                Crie aulas diretamente dentro do curso correspondente
              </li>
              <li>
                <CheckCircle2 size={18} />
                Use rascunhos para revisar conteúdo antes da publicação
              </li>
              <li>
                <CheckCircle2 size={18} />
                Publique somente links de vídeo válidos e revisados
              </li>
            </ul>
          </section>

          <section className="lessons-calendar-card">
            <CalendarDays size={26} />
            <strong>Organize por cronograma</strong>
            <p>Consulte o calendário para acompanhar os períodos dos cursos e planejar novas aulas</p>
            <Link to="/calendar">Ver calendário</Link>
          </section>
        </aside>
      </div>
    </section>
  );
};

const LessonMetric = ({ icon, value, label }: { icon: ReactNode; value: number; label: string }) => (
  <article className="lesson-metric">
    <span>{icon}</span>
    <div>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  </article>
);
