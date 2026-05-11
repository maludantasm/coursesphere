import { ArrowLeft, Award, CalendarDays, CheckCircle2, Eye, FileCheck2, MoreVertical, Plus, Search, Share2, ShieldCheck, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/ApiClient";
import type { Course } from "../api/types";
import { Loading } from "../components/Loading";
import { formatDate } from "./DashboardPage";

export const CertificatesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredCourses = useMemo(
    () => courses.filter((course) => course.name.toLowerCase().includes(search.trim().toLowerCase())),
    [courses, search]
  );
  const pageSize = 4;
  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const visibleCourses = filteredCourses.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const issuedCount = courses.filter((course) => course.endDate <= new Date().toISOString().slice(0, 10)).length;
  const eligibleCount = courses.length - issuedCount;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <section className="certificates-page">
      <header className="certificates-header">
        <div className="calendar-title-group">
          <Link className="back-home-button" to="/">
            <ArrowLeft size={22} />
            <span>Voltar para cursos</span>
          </Link>
          <div>
            <span className="calendar-eyebrow">
              <Trophy size={18} />
              Certificados
            </span>
            <h1>Certificados dos cursos</h1>
            <p>Acompanhe certificados emitidos, elegíveis e cursos em andamento</p>
          </div>
        </div>

        <Link className="button calendar-new-course" to="/courses/new">
          <Plus size={18} />
          Novo curso
        </Link>
      </header>

      <div className="certificates-metrics">
        <CertificateMetric icon={<Award size={24} />} value={issuedCount} label="Certificados emitidos" detail="Emitidos e disponíveis" />
        <CertificateMetric icon={<ShieldCheck size={24} />} value={eligibleCount} label="Cursos elegíveis em breve" detail="Aguardando conclusão" />
        <CertificateMetric icon={<FileCheck2 size={24} />} value={courses.length} label="Cursos monitorados" detail="Em acompanhamento" />
      </div>

      <div className="certificates-toolbar">
        <label className="dashboard-search">
          <Search size={19} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar certificado por curso..." />
        </label>
        <button className="dashboard-filter" type="button">
          <CalendarDays size={17} />
          Todas as datas
        </button>
      </div>

      {isLoading ? <Loading /> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="certificates-layout">
        <section className="certificates-list-panel">
          {visibleCourses.map((course) => {
            const isIssued = course.endDate <= new Date().toISOString().slice(0, 10);

            return (
              <article className="certificate-row" key={course.id}>
                <div className="certificate-preview" aria-hidden="true">
                  <span>CourseSphere</span>
                  <strong>Certificado</strong>
                  <Award size={18} />
                </div>

                <div className="certificate-row-content">
                  <h2>{course.name}</h2>
                  <p>
                    {isIssued ? "Emitido" : "Conclusão prevista"} em {formatDate(course.endDate)}
                    <span aria-hidden="true">•</span>
                    Carga horária: 40h
                  </p>
                </div>

                <span className={isIssued ? "certificate-status issued" : "certificate-status pending"}>{isIssued ? "Emitido" : "Em andamento"}</span>

                <div className="certificate-row-actions">
                  <button type="button">
                    <Eye size={16} />
                    Visualizar
                  </button>
                  <button type="button">
                    <Share2 size={16} />
                    Compartilhar
                  </button>
                  <button className="certificate-more-button" type="button" aria-label={`Mais ações para ${course.name}`}>
                    <MoreVertical size={17} />
                  </button>
                </div>
              </article>
            );
          })}

          {!filteredCourses.length && !isLoading ? <div className="empty-state">Nenhum certificado encontrado.</div> : null}

          {filteredCourses.length ? (
            <div className="certificates-pagination" aria-label="Paginação de certificados">
              <button type="button" aria-label="Página anterior" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                ‹
              </button>
              <button className="active" type="button" aria-current="page">
                {currentPage}
              </button>
              <button type="button" aria-label="Próxima página" disabled={currentPage === pageCount} onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}>
                ›
              </button>
            </div>
          ) : null}
        </section>

        <aside className="certificates-side-panel">
          <section>
            <h2>Critérios de emissão</h2>
            <ul>
              <li>
                <CheckCircle2 size={19} />
                Curso com período concluído
              </li>
              <li>
                <CheckCircle2 size={19} />
                Aulas publicadas e disponíveis para acompanhamento
              </li>
              <li>
                <CheckCircle2 size={19} />
                Dados do curso e instrutor revisados
              </li>
            </ul>
          </section>

          <section className="certificate-highlight">
            <Trophy size={28} />
            <strong>Valor para o aluno</strong>
            <p>Certificados ajudam a comprovar progresso, fortalecer portfólio e aumentar engajamento com os cursos</p>
          </section>
        </aside>
      </div>
    </section>
  );
};

const CertificateMetric = ({ icon, value, label, detail }: { icon: ReactNode; value: number; label: string; detail: string }) => (
  <article className="certificate-metric">
    <span>{icon}</span>
    <div>
      <strong>{value}</strong>
      <small>{label}</small>
      <em>{detail}</em>
    </div>
  </article>
);
