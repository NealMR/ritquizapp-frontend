"use client";
// Demo auth: stores the logged-in user in localStorage.
// Real app: call POST /auth/login, store the JWT, and fetch /auth/me.
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "./types";
import { users } from "./mock";

interface AuthCtx {
  user: User | null;
  ready: boolean;
  loginAs: (email: string) => User | null;
  logout: () => void;
}
const Ctx = createContext<AuthCtx>({ user: null, ready: false, loginAs: () => null, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rq_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const loginAs = (email: string) => {
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase()) ?? null;
    if (u) {
      setUser(u);
      try { localStorage.setItem("rq_user", JSON.stringify(u)); } catch {}
    }
    return u;
  };
  const logout = () => {
    setUser(null);
    try { localStorage.removeItem("rq_user"); } catch {}
  };
  return <Ctx.Provider value={{ user, ready, loginAs, logout }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
export const homeFor = (role?: string) => (role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student");
