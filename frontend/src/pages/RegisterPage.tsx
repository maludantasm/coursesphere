import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/ApiClient";
import { useAuth } from "../auth/AuthContext";
import { FormError } from "../components/FormError";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name || !email || password.length < 8) {
      setError("Preencha nome, email e uma senha com pelo menos 8 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const session = await apiClient.register({ name, email, password });
      signIn(session);
      navigate("/");
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page register-page">
      <Link className="register-brand" to="/login">
        <img src="/images/cs-logo-simplificada.png" alt="" />
        <div>
          <strong>COURSESPHERE</strong>
          <span>APRENDIZADO SEM LIMITES</span>
        </div>
      </Link>

      <section className="register-card">
        <div className="register-heading">
          <span className="register-icon">
            <UserPlus size={32} />
          </span>
          <p>COURSESPHERE</p>
          <h1>Criar conta</h1>
          <small>Preencha os dados abaixo para criar sua conta</small>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <label>
            Nome completo
            <span className="input-icon">
              <UserRound size={20} />
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Digite seu nome completo" required />
            </span>
          </label>

          <label>
            E-mail
            <span className="input-icon">
              <Mail size={20} />
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="Digite seu melhor e-mail" required />
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
                autoComplete="new-password"
                minLength={8}
                placeholder="Crie uma senha segura"
                required
              />
              <button className="input-action" type="button" title={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"} onClick={() => setIsPasswordVisible((visible) => !visible)}>
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </span>
          </label>

          <div className="password-tip">
            <span>
              <ShieldCheck size={22} />
            </span>
            <p>Use pelo menos 8 caracteres com letras, números e caracteres especiais para uma senha mais segura</p>
          </div>

          <FormError message={error} />

          <button className="button login-submit register-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Criando..." : "Criar conta"}
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="register-login">
          Já possui cadastro? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
};
