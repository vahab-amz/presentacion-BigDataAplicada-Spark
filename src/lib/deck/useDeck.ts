"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STEPS_OF, TOTAL_SLIDES } from "@/content/slides";
import {
  DEFAULT_OUTPUT_MODE,
  DEFAULT_THRESHOLD,
  OUTPUT_MODES,
  THRESHOLDS,
  type OutputMode,
  type Threshold,
} from "@/lib/sim/types";
import { clampPosition, formatHash, nextPosition, parseHash, prevPosition, samePosition } from "./navigation";
import {
  CHANNEL_NAME,
  THEME_STORAGE_KEY,
  type DeckMessage,
  type DeckState,
  type Position,
  type Theme,
} from "./types";

export type DeckRole = "audience" | "presenter";

export interface InternalDeckState extends DeckState {
  /** Direction of the last slide change, for the transition. */
  dir: 1 | -1;
}

/** Slide on which the 1/2/3 keys change the watermark threshold. */
export const WATERMARK_SLIDE = 7;
/** Slide on which the A/U/C keys change the output mode. */
export const MICROBATCH_SLIDE = 5;

const SENDER_ID =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tab-${Math.random().toString(36).slice(2)}`;

function readInitialState(): InternalDeckState {
  const pos = parseHash(window.location.hash, STEPS_OF) ?? { slide: 1, step: 0 };
  const theme: Theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  return {
    ...pos,
    theme,
    threshold: DEFAULT_THRESHOLD,
    outputMode: DEFAULT_OUTPUT_MODE,
    dir: 1,
  };
}

function isThreshold(v: unknown): v is Threshold {
  return typeof v === "number" && (THRESHOLDS as readonly number[]).includes(v);
}

function isOutputMode(v: unknown): v is OutputMode {
  return typeof v === "string" && (OUTPUT_MODES as readonly string[]).includes(v);
}

function isDeckMessage(v: unknown): v is DeckMessage {
  if (typeof v !== "object" || v === null) return false;
  const m = v as Record<string, unknown>;
  if (typeof m.sender !== "string") return false;
  if (m.type === "hello") return true;
  return (
    m.type === "state" &&
    typeof m.slide === "number" &&
    typeof m.step === "number" &&
    (m.theme === "dark" || m.theme === "light") &&
    isThreshold(m.threshold) &&
    isOutputMode(m.outputMode)
  );
}

function toMessage(s: DeckState): DeckMessage {
  return {
    type: "state",
    sender: SENDER_ID,
    slide: s.slide,
    step: s.step,
    theme: s.theme,
    threshold: s.threshold,
    outputMode: s.outputMode,
  };
}

function moveTo(s: InternalDeckState, p: Position): InternalDeckState {
  if (samePosition(s, p)) return s;
  const dir: 1 | -1 = p.slide === s.slide ? s.dir : p.slide > s.slide ? 1 : -1;
  return { ...s, ...p, dir };
}

export interface DeckController {
  state: InternalDeckState;
  next: () => void;
  prev: () => void;
  goTo: (pos: Position) => void;
  toggleTheme: () => void;
  setThreshold: (t: Threshold) => void;
  setOutputMode: (m: OutputMode) => void;
  toggleFullscreen: () => void;
  openCompanion: () => void;
}

export function toggleFullscreen(): void {
  if (document.fullscreenElement) {
    void document.exitFullscreen().catch(() => undefined);
  } else {
    void document.documentElement.requestFullscreen().catch(() => undefined);
  }
}

/**
 * Deck state machine shared by `/` and `/presenter`:
 * URL hash `#/<slide>/<step>`, keyboard, theme and BroadcastChannel sync.
 */
export function useDeck(role: DeckRole): DeckController {
  const [state, setState] = useState<InternalDeckState>(readInitialState);
  const stateRef = useRef(state);
  const localChange = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const update = useCallback((fn: (s: InternalDeckState) => InternalDeckState) => {
    localChange.current = true;
    setState(fn);
  }, []);

  const next = useCallback(() => update((s) => moveTo(s, nextPosition(s, STEPS_OF))), [update]);
  const prev = useCallback(() => update((s) => moveTo(s, prevPosition(s, STEPS_OF))), [update]);
  const goTo = useCallback(
    (pos: Position) => update((s) => moveTo(s, clampPosition(pos, STEPS_OF))),
    [update],
  );
  const toggleTheme = useCallback(
    () => update((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
    [update],
  );
  const setThreshold = useCallback(
    (threshold: Threshold) => update((s) => (s.threshold === threshold ? s : { ...s, threshold })),
    [update],
  );
  const setOutputMode = useCallback(
    (outputMode: OutputMode) =>
      update((s) => (s.outputMode === outputMode ? s : { ...s, outputMode })),
    [update],
  );

  const openCompanion = useCallback(() => {
    const target = role === "audience" ? "/presenter" : "/";
    const name = role === "audience" ? "spark-g6-presenter" : "spark-g6-audience";
    window.open(`${target}${window.location.hash}`, name, "popup,width=1440,height=900");
  }, [role]);

  // Keep a ref of the latest committed state for the channel's "hello" replies.
  useEffect(() => {
    stateRef.current = state;
  });

  // URL hash ← state (replaceState: no history spam, reload keeps the position).
  useEffect(() => {
    const hash = formatHash(state);
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, [state]);

  // state ← URL hash (manual edits in the address bar).
  useEffect(() => {
    const onHashChange = () => {
      const pos = parseHash(window.location.hash, STEPS_OF);
      if (pos) update((s) => moveTo(s, pos));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [update]);

  // Theme → <html data-theme>, persisted per browser.
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
    } catch {
      /* storage blocked: theme still applies for this session */
    }
  }, [state.theme]);

  // BroadcastChannel: receive remote state; answer "hello" from new windows.
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<unknown>) => {
      const msg = event.data;
      if (!isDeckMessage(msg) || msg.sender === SENDER_ID) return;
      if (msg.type === "hello") {
        channel.postMessage(toMessage(stateRef.current));
        return;
      }
      setState((s) => {
        const pos = clampPosition(msg, STEPS_OF);
        const moved = moveTo(s, pos);
        if (
          moved === s &&
          s.theme === msg.theme &&
          s.threshold === msg.threshold &&
          s.outputMode === msg.outputMode
        ) {
          return s;
        }
        return { ...moved, theme: msg.theme, threshold: msg.threshold, outputMode: msg.outputMode };
      });
    };
    // A newly opened window adopts the state of the running deck (it never broadcasts first).
    channel.postMessage({ type: "hello", sender: SENDER_ID } satisfies DeckMessage);
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  // Broadcast local changes only (remote ones are applied without echo).
  useEffect(() => {
    if (!localChange.current) return;
    localChange.current = false;
    channelRef.current?.postMessage(toMessage(state));
  }, [state]);

  // Keyboard (remotes send PageDown / PageUp).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const slide = stateRef.current.slide;
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
        case "Enter":
          e.preventDefault();
          next();
          return;
        case "ArrowLeft":
        case "PageUp":
        case "Backspace":
          e.preventDefault();
          prev();
          return;
        case "Home":
          e.preventDefault();
          goTo({ slide: 1, step: 0 });
          return;
        case "End":
          e.preventDefault();
          goTo({ slide: TOTAL_SLIDES, step: 0 });
          return;
      }
      if (e.repeat) return;
      switch (e.key.toLowerCase()) {
        case "f":
          e.preventDefault();
          toggleFullscreen();
          return;
        case "t":
          e.preventDefault();
          toggleTheme();
          return;
        case "p":
          e.preventDefault();
          openCompanion();
          return;
        case "1":
        case "2":
        case "3":
          if (slide === WATERMARK_SLIDE) {
            e.preventDefault();
            setThreshold(THRESHOLDS[Number(e.key) - 1]);
          }
          return;
        case "a":
        case "u":
        case "c":
          if (slide === MICROBATCH_SLIDE) {
            e.preventDefault();
            const mode: OutputMode =
              e.key.toLowerCase() === "a" ? "append" : e.key.toLowerCase() === "u" ? "update" : "complete";
            setOutputMode(mode);
          }
          return;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, goTo, toggleTheme, openCompanion, setThreshold, setOutputMode]);

  return {
    state,
    next,
    prev,
    goTo,
    toggleTheme,
    setThreshold,
    setOutputMode,
    toggleFullscreen,
    openCompanion,
  };
}
