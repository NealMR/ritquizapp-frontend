"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./auth";
import type { ClassRoom, Quiz } from "./types";

interface DataCtx {
  classes: ClassRoom[];
  quizzes: Quiz[];
  loaded: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<DataCtx>({ classes: [], quizzes: [], loaded: false, refresh: async () => {} });

/** The signed-in user's classes and quizzes. Reloads whenever the user changes. */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || user.role === "admin") return;
    try {
      const [c, q] = await Promise.all([api.getClasses(), api.getQuizzes()]);
      setClasses(c);
      setQuizzes(q);
    } catch (e) {
      console.error(e);
    } finally {
      setLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    setClasses([]);
    setQuizzes([]);
    setLoaded(false);
    refresh();
  }, [refresh]);

  return <Ctx.Provider value={{ classes, quizzes, loaded, refresh }}>{children}</Ctx.Provider>;
}

export const useData = () => useContext(Ctx);
