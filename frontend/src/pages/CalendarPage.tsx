import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/ApiClient";
import type { Course } from "../api/types";
import { Loading } from "../components/Loading";
import { formatDate } from "./DashboardPage";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const CalendarPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleDate, setVisibleDate] = useState(() => new Date());

  useEffect(() => {
    apiClient
      .listCourses("")
      .then((courseList) => {
        setCourses(courseList);
        setError(null);
      })
      .catch((requestError) => setError((requestError as Error).message))
      .finally(() => setIsLoading(false));
  }, []);

  const monthDays = useMemo(() => buildMonthDays(visibleDate), [visibleDate]);
  const currentMonthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(visibleDate);

  const upcomingCourses = [...courses]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  const moveMonth = (direction: number) => {
    setVisibleDate((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  };

  return (
    <section className="calendar-page">
      <header className="calendar-header">
        <div className="calendar-title-group">
          <Link className="back-home-button" to="/">
            <ArrowLeft size={22} />
            <span>Voltar para cursos</span>
          </Link>
          <div>
            <span className="calendar-eyebrow">
              <CalendarDays size={18} />
              Calendário
            </span>
            <h1>Agenda de cursos</h1>
            <p>Visualize períodos de curso, inícios e encerramentos em uma única agenda</p>
          </div>
        </div>

        <Link className="button calendar-new-course" to="/courses/new">
          <Plus size={18} />
          Novo curso
        </Link>
      </header>

      {isLoading ? <Loading /> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="calendar-layout">
        <section className="calendar-panel">
          <div className="calendar-month-bar">
            <button type="button" aria-label="Mês anterior" onClick={() => moveMonth(-1)}>
              <ChevronLeft size={18} />
            </button>
            <strong>{currentMonthLabel}</strong>
            <button type="button" aria-label="Próximo mês" onClick={() => moveMonth(1)}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="calendar-grid">
            {weekDays.map((day) => (
              <span className="calendar-weekday" key={day}>
                {day}
              </span>
            ))}

            {monthDays.map((day) => {
              const dayCourses = courses.filter((course) => isDateInsideCourse(day.dateKey, course));

              return (
                <div className={`calendar-day ${day.isCurrentMonth ? "" : "muted"}`} key={day.dateKey}>
                  <span>{day.date.getDate()}</span>
                  <div>
                    {dayCourses.slice(0, 2).map((course) => (
                      <Link className="calendar-event" key={course.id} to={`/courses/${course.id}`}>
                        {course.name}
                      </Link>
                    ))}
                    {dayCourses.length > 2 ? <small>+{dayCourses.length - 2} eventos</small> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="calendar-side-panel">
          <section>
            <h2>Próximos cursos</h2>
            <div className="calendar-upcoming-list">
              {upcomingCourses.map((course) => (
                <Link className="calendar-upcoming-item" key={course.id} to={`/courses/${course.id}`}>
                  <span>
                    <Clock size={18} />
                  </span>
                  <div>
                    <strong>{course.name}</strong>
                    <small>
                      {formatDate(course.startDate)} - {formatDate(course.endDate)}
                    </small>
                  </div>
                </Link>
              ))}

              {!upcomingCourses.length && !isLoading ? <p className="muted">Nenhum curso cadastrado.</p> : null}
            </div>
          </section>

          <section className="calendar-summary-card">
            <strong>{courses.length}</strong>
            <span>cursos no calendário</span>
            <p>Use esta visão para planejar datas, acompanhar períodos ativos e evitar sobreposição de turmas</p>
          </section>
        </aside>
      </div>
    </section>
  );
};

const buildMonthDays = (visibleDate: Date) => {
  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = toDateKey(date);

    return {
      date,
      dateKey,
      isCurrentMonth: date.getMonth() === month
    };
  });
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isDateInsideCourse = (dateKey: string, course: Course) => dateKey >= course.startDate && dateKey <= course.endDate;
