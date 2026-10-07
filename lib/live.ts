"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getToken, WS_URL } from "./api";
import type { LiveState } from "./types";

/** Connects to the live-quiz WebSocket, reconnecting on drops. The server sends the full state each time. */
export function useQuizSocket(quizId: number) {
  const [state, setState] = useState<LiveState | null>(null);
  const [event, setEvent] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  // Client-side countdown, re-synced from time_left_ms on every message.
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let closed = false;
    let retry: ReturnType<typeof setTimeout>;
    const open = () => {
      const sock = new WebSocket(`${WS_URL}/ws/quiz/${quizId}?token=${getToken() ?? ""}`);
      ws.current = sock;
      sock.onopen = () => setConnected(true);
      sock.onmessage = (m) => {
        const msg = JSON.parse(m.data);
        if (msg.event === "error") return setError(msg.detail);
        setError("");
        setEvent(msg.event);
        setState(msg.state);
        const s: LiveState = msg.state;
        setDeadline(s.phase === "question" && !s.paused ? Date.now() + s.time_left_ms : null);
      };
      sock.onclose = (e) => {
        setConnected(false);
        // 4401/4403: auth or access problem, 4409: opened in another tab. Don't retry those.
        if (!closed && ![4401, 4403, 4409].includes(e.code)) retry = setTimeout(open, 1500);
      };
    };
    open();
    return () => { closed = true; clearTimeout(retry); ws.current?.close(); };
  }, [quizId]);

  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [deadline]);

  const send = useCallback((event: string, data: Record<string, unknown> = {}) => {
    ws.current?.readyState === WebSocket.OPEN && ws.current.send(JSON.stringify({ event, ...data }));
  }, []);

  const secondsLeft = state?.phase !== "question" ? 0
    : deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : Math.ceil(state.time_left_ms / 1000);

  return { state, event, error, connected, send, secondsLeft };
}
