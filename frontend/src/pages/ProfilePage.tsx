import { ArrowLeft, Award, BookOpen, CheckCircle2, Mail, ShieldCheck, UserRound, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/ApiClient";
import type { Course, Lesson } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { Loading } from "../components/Loading";
import { formatDate } from "./DashboardPage";

type CourseWithLessons = Course & {
  lessons: Lesson[];
};

export const ProfilePage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseWithLessons[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      const courseList = await apiClient.listCourses("");
      const coursesWithLessons = await Promise.all(
        courseList.map(async (course) => ({
          ...course,
          lessons: await apiClient.listLessons(course.id).catch(() => [])
        }))
      );

      setCourses(coursesWithLessons);
    };

    loadProfileData()
      .then(() => setError(null))
      .catch((requestError) => setError((requestError as Error).message))
      .finally(() => setIsLoading(false));
  }, []);

  const profileStats = useMemo(() => {
    const totalLessons = courses.reduce((total, course) => total + course.lessons.length, 0);
    const publishedLessons = courses.reduce((total, course) => total + course.lessons.filter((lesson) => lesson.status === "published").length, 0);
    const concludedCourses = courses.filter((course) => course.endDate <= new Date().toISOString().slice(0, 10)).length;

    return {
      totalCourses: courses.length,
      totalLessons,
      publishedLessons,
      concludedCourses
    };
  }, [courses]);

  const initials = getInitials(user?.name ?? "Demo User");
  const recentCourses = [...courses].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);

  return (
    <section className="profile-page">
      <header className="profile-header">
        <div className="calendar-title-group">
          <Link className="back-home-button" to="/">
            <ArrowLeft size={22} />
            <span>Voltar para cursos</span>
          </Link>
          <div>
            <span className="calendar-eyebrow">
              <UserRound size={18} />
              Perfil
            </span>
            <h1>Minha conta</h1>
            <p>Veja seus dados de acesso, atividade na plataforma e resumo de produção de conteúdo</p>
          </div>
        </div>
      </header>

      {isLoading ? <Loading /> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="profile-layout">
        <section className="profile-card">
          <div className="profile-avatar-large">{initials}</div>
          <span className="profile-role">Administrador de cursos</span>
          <h2>{user?.name ?? "Demo User"}</h2>
          <p>{user?.email ?? "demo@coursesphere.dev"}</p>

          <div className="profile-info-list">
            <ProfileInfo icon={<Mail size={18} />} label="E-mail de acesso" value={user?.email ?? "Não informado"} />
            <ProfileInfo icon={<ShieldCheck size={18} />} label="Sessão" value="Autenticada via JWT" />
            <ProfileInfo icon={<CheckCircle2 size={18} />} label="Permissão" value="Criador gerencia seus próprios cursos e aulas" />
          </div>
        </section>

        <section className="profile-main-panel">
          <div className="profile-metrics">
            <ProfileMetric icon={<BookOpen size={22} />} value={profileStats.totalCourses} label="Cursos criados" />
            <ProfileMetric icon={<Video size={22} />} value={profileStats.totalLessons} label="Aulas cadastradas" />
            <ProfileMetric icon={<CheckCircle2 size={22} />} value={profileStats.publishedLessons} label="Aulas publicadas" />
            <ProfileMetric icon={<Award size={22} />} value={profileStats.concludedCourses} label="Certificados emitidos" />
          </div>

          <div className="profile-activity-card">
            <div>
              <h2>Atividade recente</h2>
              <p>Últimos cursos atualizados na sua área autenticada</p>
            </div>

            <div className="profile-activity-list">
              {recentCourses.map((course) => (
                <Link className="profile-activity-item" key={course.id} to={`/courses/${course.id}`}>
                  <span>
                    <BookOpen size={18} />
                  </span>
                  <div>
                    <strong>{course.name}</strong>
                    <small>
                      Atualizado em {formatDate(course.updatedAt)} · {course.lessons.length} aulas
                    </small>
                  </div>
                </Link>
              ))}

              {!recentCourses.length && !isLoading ? <div className="empty-state">Nenhuma atividade encontrada.</div> : null}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

const ProfileMetric = ({ icon, value, label }: { icon: ReactNode; value: number; label: string }) => (
  <article className="profile-metric">
    <span>{icon}</span>
    <div>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  </article>
);

const ProfileInfo = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="profile-info-item">
    <span>{icon}</span>
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  </div>
);

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
