import { ArrowLeft, BookOpen, CalendarDays, CheckCircle2, GraduationCap, Info, Save, ScrollText, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../api/ApiClient";
import type { CoursePayload } from "../api/types";
import { FormError } from "../components/FormError";
import { Loading } from "../components/Loading";

const emptyForm: CoursePayload = {
  name: "",
  description: "",
  startDate: "",
  endDate: ""
};

export const CourseFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<CoursePayload>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    apiClient
      .getCourse(id)
      .then((course) =>
        setForm({
          name: course.name,
          description: course.description ?? "",
          startDate: course.startDate,
          endDate: course.endDate
        })
      )
      .catch((requestError) => setError((requestError as Error).message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (form.name.trim().length < 3 || !form.startDate || !form.endDate) {
      setError("Informe nome, data inicial e data final.");
      return;
    }

    if (form.endDate < form.startDate) {
      setError("A data final deve ser igual ou posterior a data inicial");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { ...form, description: form.description || null };
      const course = id ? await apiClient.updateCourse(id, payload) : await apiClient.createCourse(payload);
      navigate(`/courses/${course.id}`);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Excluir este curso e todas as aulas?")) {
      return;
    }

    try {
      await apiClient.deleteCourse(id);
      navigate("/");
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  };

  if (isLoading) {
    return <Loading label="Carregando curso" />;
  }

  return (
    <section className="course-form-page">
      <div className="course-form-header">
        <Link className="back-home-button" to="/">
          <ArrowLeft size={22} />
          <span>Voltar para cursos</span>
        </Link>
        <div>
          <h1>{isEditing ? "Editar curso" : "Novo curso"}</h1>
          <p>Defina as informações do seu curso para começar.</p>
        </div>
      </div>

      <div className="course-form-layout">
        <form className="course-form-card" onSubmit={handleSubmit}>
          <label className="course-field">
            <span>Nome do curso</span>
            <span className="course-input-shell">
              <BookOpen size={20} />
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                minLength={3}
                placeholder="Ex.: Introdução ao Full Stack"
                required
              />
            </span>
            <small>Mínimo de 3 caracteres.</small>
          </label>

          <label className="course-field">
            <span>Descrição</span>
            <span className="course-input-shell textarea">
              <ScrollText size={20} />
              <textarea
                value={form.description ?? ""}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={4}
                placeholder="Descreva o que os alunos irão aprender, objetivos e diferenciais do curso..."
              />
            </span>
            <small>Opcional</small>
          </label>

          <div className="course-date-grid">
            <label className="course-field">
              <span>Data de início</span>
              <span className="course-input-shell">
                <CalendarDays size={20} />
                <input value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} type="date" required />
              </span>
            </label>

            <label className="course-field">
              <span>Data de término</span>
              <span className="course-input-shell">
                <CalendarDays size={20} />
                <input value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} type="date" required />
              </span>
            </label>
          </div>

          <p className="course-form-hint">
            <Info size={16} />
            A data de término deve ser igual ou posterior à data de início
          </p>

          <FormError message={error} />

          <div className="course-form-actions">
            <button className="button course-primary-action" disabled={isSubmitting} type="submit">
              <Save size={18} />
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar curso" : "Criar curso"}
            </button>
            <Link className="button course-secondary-action" to={id ? `/courses/${id}` : "/"}>
              Cancelar
            </Link>
            {id ? (
              <button className="button button-danger" type="button" onClick={handleDelete}>
                <Trash2 size={18} />
                Excluir
              </button>
            ) : null}
          </div>
        </form>

        <aside className="course-tips-card">
          <span className="tips-icon">
            <GraduationCap size={28} />
          </span>
          <h2>Dicas para um bom curso</h2>

          <ul>
            <li>
              <CheckCircle2 size={20} />
              <span>Escolha um nome claro e objetivo que represente bem o conteúdo</span>
            </li>
            <li>
              <CheckCircle2 size={20} />
              <span>Uma boa descrição ajuda os alunos a entenderem o valor do curso</span>
            </li>
            <li>
              <CheckCircle2 size={20} />
              <span>Defina datas realistas para planejamento e organização</span>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
};
