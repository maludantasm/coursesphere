import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { apiClient } from "../api/ApiClient";
import type { AuthSession, User } from "../api/types";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  signIn: (session: AuthSession) => void;
  signOut: () => void;
};

const SESSION_KEY = "coursesphere.session";

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredSession = (): AuthSession | null => {
  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const stored = readStoredSession();
    apiClient.setToken(stored?.token ?? null);
    return stored;
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      signIn: (nextSession) => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
        apiClient.setToken(nextSession.token);
        setSession(nextSession);
      },
      signOut: () => {
        localStorage.removeItem(SESSION_KEY);
        apiClient.setToken(null);
        setSession(null);
      }
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
