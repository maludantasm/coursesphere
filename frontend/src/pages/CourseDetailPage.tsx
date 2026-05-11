import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Clapperboard, Edit3, ExternalLink, Filter, Lightbulb, Plus, Search, Trash2, UsersRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../api/ApiClient";
import { fetchGuestInstructor, type GuestInstructor } from "../api/randomUser";
import type { Course, Lesson, LessonPayload, LessonStatus } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { FormError } from "../components/FormError";
import { Loading } from "../components/Loading";
import { formatDate } from "./DashboardPage";

const emptyLesson: LessonPayload = {
  title: "",
  status: "draft",
  videoUrl: ""
};

export const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonForm, setLessonForm] = useState<LessonPayload>(emptyLesson);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [lessonSearch, setLessonSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LessonStatus | "all">("all");
  const [guest, setGuest] = useState<GuestInstructor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const canManage = Boolean(course && user?.id === course.creatorId);

  const loadLessons = async (courseId: string, status: LessonStatus | "all") => {
    setLessons(await apiClient.listLessons(courseId, status));
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    Promise.all([apiClient.getCourse(id), apiClient.listLessons(id, statusFilter), fetchGuestInstructor().catch(() => null)])
      .then(([courseData, lessonData, guestData]) => {
        setCourse(courseData);
        setLessons(lessonData);
        setGuest(guestData);
      })
      .catch((requestError) => setError((requestError as Error).message))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || isLoading) {
      return;
    }

    loadLessons(id, statusFilter).catch((requestError) => setError((requestError as Error).message));
  }, [id, statusFilter, isLoading]);

  const handleLessonSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLessonError(null);

    if (!id || lessonForm.title.trim().length < 3) {
      setLessonError("Informe um titulo com pelo menos 3 caracteres.");
      return;
    }

    try {
      if (editingLessonId) {
        await apiClient.updateLesson(editingLessonId, { ...lessonForm, videoUrl: lessonForm.videoUrl || null });
      } else {
        await apiClient.createLesson(id, { ...lessonForm, videoUrl: lessonForm.videoUrl || null });
      }

      setLessonForm(emptyLesson);
      setEditingLessonId(null);
      setIsLessonFormOpen(false);
      await loadLessons(id, statusFilter);
    } catch (requestError) {
      setLessonError((requestError as Error).message);
    }
  };

  const editLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title,
      status: lesson.status,
      videoUrl: lesson.videoUrl ?? ""
    });
    setIsLessonFormOpen(true);
  };

  const deleteLesson = async (lessonId: string) => {
    if (!id || !confirm("Excluir esta aula?")) {
      return;
    }

    try {
      await apiClient.deleteLesson(lessonId);
      await loadLessons(id, statusFilter);
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  };

  if (isLoading) {
    return <Loading label="Carregando detalhes" />;
  }

  if (!course) {
    return <div className="empty-state">Curso nao encontrado.</div>;
  }

  const filteredLessons = lessons.filter((lesson) => lesson.title.toLowerCase().includes(lessonSearch.trim().toLowerCase()));
  const completion = lessons.length ? Math.round((lessons.filter((lesson) => lesson.status === "published").length / lessons.length) * 100) : 45;

  return (
    <section className="course-detail-page">
      <header className="course-detail-header">
        <Link className="back-home-button" to="/">
          <ArrowLeft size={22} />
          <span>Voltar para cursos</span>
        </Link>

        <div className="course-detail-heading">
          <div className="course-title-row">
            <h1>{course.name}</h1>
            <span className="course-state published">Publicado</span>
          </div>
          <p>
            <CalendarDays size={18} />
            {formatDate(course.startDate)} - {formatDate(course.endDate)}
            <span>•</span>
            Criado por {course.creator?.name ?? "usuario removido"}
          </p>
        </div>

        {canManage ? (
          <Link className="course-edit-button" to={`/courses/${course.id}/edit`}>
            <Edit3 size={18} />
            Editar curso
          </Link>
        ) : null}
      </header>

      {error ? <div className="form-error">{error}</div> : null}

      <p className="course-detail-description">{course.description || "Este curso ainda nao possui descricao."}</p>

      <div className="course-detail-layout">
        <section className="course-lessons-panel">
          <nav className="course-tabs" aria-label="Curso">
            <button className="active" type="button">Aulas</button>
            <button type="button">Visão geral</button>
            <button type="button">Alunos</button>
            <button type="button">Configurações</button>
          </nav>

          <div className="course-lessons-toolbar">
            <label className="dashboard-search">
              <Search size={19} />
              <input value={lessonSearch} onChange={(event) => setLessonSearch(event.target.value)} placeholder="Buscar aula por título..." />
            </label>

            <label className="dashboard-filter lesson-status-filter">
              <Filter size={18} />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as LessonStatus | "all")}>
                <option value="all">Todos os status</option>
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </label>
          </div>

          {isLessonFormOpen && canManage ? (
            <form className="lesson-inline-form" onSubmit={handleLessonSubmit}>
              <h2>{editingLessonId ? "Editar aula" : "Nova aula"}</h2>
              <div className="lesson-form-grid">
                <label>
                  Título
                  <input value={lessonForm.title} onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })} minLength={3} required />
                </label>

                <label>
                  Status
                  <select value={lessonForm.status} onChange={(event) => setLessonForm({ ...lessonForm, status: event.target.value as LessonStatus })}>
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </label>

                <label>
                  URL do vídeo
                  <input value={lessonForm.videoUrl ?? ""} onChange={(event) => setLessonForm({ ...lessonForm, videoUrl: event.target.value })} type="url" />
                </label>
              </div>

              <FormError message={lessonError} />

              <div className="course-form-actions">
                <button className="button course-primary-action" type="submit">
                  <Plus size={18} />
                  {editingLessonId ? "Salvar aula" : "Criar aula"}
                </button>
                <button
                  className="button course-secondary-action"
                  type="button"
                  onClick={() => {
                    setIsLessonFormOpen(false);
                    setEditingLessonId(null);
                    setLessonForm(emptyLesson);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : null}

          <div className="course-lessons-content">
            {filteredLessons.map((lesson) => (
              <article className="course-lesson-row" key={lesson.id}>
                <div>
                  <h3>{lesson.title}</h3>
                  <span className={`status ${lesson.status}`}>{lesson.status === "draft" ? "Rascunho" : "Publicado"}</span>
                  {lesson.videoUrl ? (
                    <a href={lesson.videoUrl} target="_blank" rel="noreferrer">
                      <ExternalLink size={15} />
                      Vídeo
                    </a>
                  ) : null}
                </div>

                {canManage ? (
                  <div className="row-actions">
                    <button className="icon-button" type="button" title="Editar aula" onClick={() => editLesson(lesson)}>
                      <Edit3 size={17} />
                    </button>
                    <button className="icon-button danger" type="button" title="Excluir aula" onClick={() => deleteLesson(lesson.id)}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                ) : null}
              </article>
            ))}

            {!filteredLessons.length ? (
              <div className="course-empty-lessons">
                <Clapperboard size={118} />
                <h2>Nenhuma aula encontrada</h2>
                <p>Comece adicionando a primeira aula do seu curso.</p>
                {canManage ? (
                  <button className="button course-primary-action lesson-add-button" type="button" onClick={() => setIsLessonFormOpen(true)}>
                    Nova aula
                    <Plus aria-hidden="true" size={20} />
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <aside className="course-info-panel">
          <section className="course-instructor-card">
            <h2>Instrutor</h2>
            <div className="course-instructor">
              <img src={guest?.photo ?? "/images/cs-logo-simplificada.png"} alt={guest?.name ?? "Instrutor"} />
              <div>
                <span>INSTRUTOR</span>
                <strong>{guest?.name ?? course.creator?.name ?? "Demo User"}</strong>
                <small>{guest?.email ?? course.creator?.email ?? "demo@coursesphere.dev"}</small>
              </div>
            </div>

            <div className="course-info-list">
              <h2>Informações do curso</h2>
              <InfoItem icon={<CalendarDays size={21} />} label="Período" value={`${formatDate(course.startDate)} - ${formatDate(course.endDate)}`} />
              <InfoItem icon={<BookOpen size={21} />} label="Categoria" value="Desenvolvimento" />
              <InfoItem icon={<UsersRound size={21} />} label="Alunos" value="126 alunos inscritos" />
              <InfoItem icon={<ArrowUpRight size={21} />} label="Conclusão média" value={`${completion}%`} />
            </div>

            <div className="course-tip-box">
              <strong>
                <Lightbulb size={20} />
                Dica
              </strong>
              <p>Mantenha seu conteúdo atualizado para engajar ainda mais seus alunos</p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
};

const InfoItem = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="course-info-item">
    {icon}
    <div>
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  </div>
);
