import { ArrowRight, BarChart3, BookOpen, Eye, EyeOff, LockKeyhole, Mail, Trophy } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/ApiClient";
import { useAuth } from "../auth/AuthContext";
import { FormError } from "../components/FormError";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Informe email e senha.");
      return;
    }

    try {
      setIsSubmitting(true);
      const session = await apiClient.login({ email, password });
      signIn(session);
      navigate("/");
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page login-page">
      <section className="login-shell" aria-label="CourseSphere login">
        <div className="login-showcase">
          <div className="login-brand-lockup">
            <img src="/images/cs-logo-simplificada.png" alt="" />
            <div>
              <strong>COURSESPHERE</strong>
              <span>APRENDIZADO SEM LIMITES</span>
            </div>
          </div>

          <div className="login-copy">
            <h1>
              Sua jornada de aprendizado <span>começa aqui</span>
            </h1>
            <p>Cursos de qualidade, especialistas renomados e conteúdo que transforma seu futuro</p>
          </div>

          <div className="login-benefits" aria-label="Beneficios">
            <div className="login-benefit">
              <span>
                <BookOpen size={24} />
              </span>
              <div>
                <strong>Aprenda com especialistas</strong>
                <small>Conteúdo atualizado e relevante</small>
              </div>
            </div>

            <div className="login-benefit">
              <span>
                <BarChart3 size={24} />
              </span>
              <div>
                <strong>Evolua no seu ritmo</strong>
                <small>Aprenda onde e quando quiser</small>
              </div>
            </div>

            <div className="login-benefit">
              <span>
                <Trophy size={24} />
              </span>
              <div>
                <strong>Conquiste seus objetivos</strong>
                <small>Certificados e reconhecimento</small>
              </div>
            </div>
          </div>
        </div>

        <section className="login-card">
          <div className="login-heading">
            <h2>Bem-vindo de volta!</h2>
            <p>Faça login para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label>
              E-mail
              <span className="input-icon">
                <Mail size={20} />
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="seu@email.com" required />
              </span>
            </label>

            <label>
              Senha
              <span className="input-icon">
                <LockKeyhole size={20} />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  minLength={8}
                  placeholder="********"
                  required
                />
                <button className="input-action" type="button" title={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"} onClick={() => setIsPasswordVisible((visible) => !visible)}>
                  {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
              <a className="forgot-password-link" href="#forgot-password">
                Esqueci minha senha
              </a>
            </label>

            <FormError message={error} />

            <button className="button login-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Entrando..." : "Entrar na plataforma"}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="auth-divider">
            <span />
            <small>ou continue com</small>
            <span />
          </div>

          <button className="google-button" type="button" onClick={() => setError("Login com Google ainda não está configurado")}>
            <svg aria-hidden="true" className="google-logo" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
            </svg>
            Entrar com Google
          </button>

          <p className="login-register">
            Ainda não tem conta? <Link to="/register">Criar conta gratuita</Link>
          </p>
        </section>
      </section>
    </main>
  );
};
