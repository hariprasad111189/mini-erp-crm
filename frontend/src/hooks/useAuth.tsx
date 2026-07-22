import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { api } from "@/api/client";
import { authApi } from "@/api/endpoints";
import type { SessionUser } from "@/api/types";

type Session = {
  token: string;
  user: SessionUser;
};

type AuthContextValue = {
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const readSession = (): Session | null => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (!token || !user) return null;
  return { token, user: JSON.parse(user) as SessionUser };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(() => readSession());

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      async login(email, password) {
        const nextSession = await authApi.login({ email, password });
        localStorage.setItem("token", nextSession.token);
        localStorage.setItem("user", JSON.stringify(nextSession.user));
        api.defaults.headers.common.Authorization = `Bearer ${nextSession.token}`;
        setSession(nextSession);
      },
      logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common.Authorization;
        setSession(null);
      }
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
};

