import { BookOpen, CalendarDays, ChevronDown, LogOut, Moon, Plus, Sparkles, Sun, Trophy, UserRound, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export const AppShell = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("coursesphere.theme") === "dark");
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const initials = user?.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("coursesphere.theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!userDropdownRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isUserMenuOpen]);

  return (
    <div className="app dashboard-app">
      <aside className="dashboard-sidebar">
        <header className="dashboard-topbar">
          <div className="dashboard-theme-actions">
            <button className="theme-switch" type="button" aria-label="Alternar modo claro e escuro" aria-pressed={isDarkMode} onClick={() => setIsDarkMode((enabled) => !enabled)}>
              <Sun size={13} />
              <span />
              <Moon size={13} />
            </button>
          </div>

          <div className="dashboard-user-actions">
            <div className="dashboard-avatar">{initials || "DU"}</div>
            <div className="user-dropdown" ref={userDropdownRef}>
              <button className="user-dropdown-trigger" type="button" aria-expanded={isUserMenuOpen} aria-haspopup="menu" onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}>
                <span>{user?.name}</span>
                <ChevronDown size={16} />
              </button>

              {isUserMenuOpen ? (
                <div className="user-dropdown-menu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      signOut();
                      navigate("/login");
                    }}
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <Link className="dashboard-brand" to="/">
          <img src="/images/cs-logo-simplificada.png" alt="" />
          <div>
            <strong>COURSESPHERE</strong>
            <span>APRENDIZADO SEM LIMITES</span>
          </div>
        </Link>

        <nav className="dashboard-nav" aria-label="Principal">
          <NavLink to="/" end>
            <BookOpen size={20} />
            Cursos
          </NavLink>
          <NavLink to="/lessons">
            <Video size={20} />
            Aulas
          </NavLink>
          <NavLink to="/calendar">
            <CalendarDays size={20} />
            Calendário
          </NavLink>
          <NavLink to="/certificates">
            <Trophy size={20} />
            Certificados
          </NavLink>
          <NavLink to="/profile">
            <UserRound size={20} />
            Perfil
          </NavLink>
        </nav>

        <div className="sidebar-promo">
          <span>
            <Sparkles size={20} />
          </span>
          <strong>Transforme conhecimento em oportunidades.</strong>
          <p>Crie, compartilhe e evolua com a CourseSphere.</p>
          <Link to="/courses/new">
            Saiba mais
            <Plus size={16} />
          </Link>
        </div>
      </aside>

      <div className="dashboard-workspace">
        <main className="content dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
