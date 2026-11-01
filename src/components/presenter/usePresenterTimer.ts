"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Speaker } from "@/lib/deck/types";

export interface PresenterTimer {
  running: boolean;
  elapsedMs: number;
  perSpeakerMs: Record<Speaker, number>;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

const ZERO: Record<Speaker, number> = { Vau: 0, Onai: 0 };

/** Elapsed talk timer plus a per-speaker timer (time spent on each speaker's slides). */
export function usePresenterTimer(currentSpeaker: Speaker): PresenterTimer {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [perSpeakerMs, setPerSpeakerMs] = useState<Record<Speaker, number>>(ZERO);
  const lastTick = useRef(0);
  const speakerRef = useRef(currentSpeaker);

  useEffect(() => {
    speakerRef.current = currentSpeaker;
  }, [currentSpeaker]);

  useEffect(() => {
    if (!running) return;
    lastTick.current = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = now - lastTick.current;
      lastTick.current = now;
      const speaker = speakerRef.current;
      setElapsedMs((ms) => ms + delta);
      setPerSpeakerMs((p) => ({ ...p, [speaker]: p[speaker] + delta }));
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setElapsedMs(0);
    setPerSpeakerMs(ZERO);
  }, []);

  return { running, elapsedMs, perSpeakerMs, start, pause, reset };
}

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
