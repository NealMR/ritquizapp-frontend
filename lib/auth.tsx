"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "./types";

interface AuthCtx {
  user: User | null;
  ready: boolean;
  /** Throws an Error with the server's message on failure. */
  loginAs: (email: string, password: string) => Promise<User>;
  googleLogin: (credential: string) => Promise<User>;
  updateUser: (u: User) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({
  user: null, ready: false, loginAs: async () => { throw new Error("not ready"); }, googleLogin: async () => { throw new Error("not ready"); },
  updateUser: () => {}, logout: () => {},
});

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      // The Android wrapper opens the site with an android-app:// referrer; remember that it's the student app.
      if (document.referrer.startsWith("android-app://")) localStorage.setItem("rq_app", "1");
      const rawUser = localStorage.getItem("rq_user");
      if (rawUser) setUser(JSON.parse(rawUser));
    } catch {}
    setReady(true);
  }, []);

  const updateUser = (u: User) => {
    setUser(u);
    try { localStorage.setItem("rq_user", JSON.stringify(u)); } catch {}
  };

  const post = async (path: string, body: unknown): Promise<User> => {
    let res: Response;
    try {
      res = await fetch(`${API}/api/auth/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } catch {
      throw new Error("Can't reach the server. Check your connection.");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(res.status === 401 ? "Invalid email or password." : typeof data.detail === "string" ? data.detail : "Login failed.");
    if (data.user.role !== "student" && localStorage.getItem("rq_app") === "1")
      throw new Error("The app is for students. Teachers and admins: please use the website in your browser.");
    localStorage.setItem("rq_token", data.access_token);
    updateUser(data.user);
    return data.user;
  };

  const loginAs = (email: string, password: string) => post("login", { email, password });
  const googleLogin = (credential: string) => post("google", { credential });

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rq_user");
    localStorage.removeItem("rq_token");
  };

  return <Ctx.Provider value={{ user, ready, loginAs, googleLogin, updateUser, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
export const homeFor = (role?: string) => (role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student");
