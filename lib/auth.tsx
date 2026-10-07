"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "./types";

interface AuthCtx {
  user: User | null;
  ready: boolean;
  loginAs: (email: string, password?: string) => Promise<User | null>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({ user: null, ready: false, loginAs: async () => null, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("rq_user");
      if (rawUser) setUser(JSON.parse(rawUser));
    } catch {}
    setReady(true);
  }, []);

  const loginAs = async (email: string, password?: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "password" })
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const u = data.user;
      
      setUser(u);
      localStorage.setItem("rq_user", JSON.stringify(u));
      localStorage.setItem("rq_token", data.access_token);
      return u;
    } catch (e) {
      console.error("Login failed:", e);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rq_user");
    localStorage.removeItem("rq_token");
  };

  return <Ctx.Provider value={{ user, ready, loginAs, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
export const homeFor = (role?: string) => (role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student");
