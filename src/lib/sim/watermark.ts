import { formatClock, parseClock, type Threshold } from "./types";

/**
 * Slide 7 · watermark simulator (pure, deterministic, step-driven).
 * Simplification: 1 event = 1 micro-batch.
 */

export const WINDOW_MINUTES = 10;

export interface WindowDef {
  index: number;
  start: number; // minutes since midnight (inclusive)
  end: number; // exclusive
  label: string; // "[12:00, 12:10)"
}

export const WINDOWS: readonly WindowDef[] = [720, 730, 740].map((start, index) => ({
  index,
  start,
  end: start + WINDOW_MINUTES,
  label: `[${formatClock(start)}, ${formatClock(start + WINDOW_MINUTES)})`,
}));

export interface EventDef {
  id: string;
  time: number;
  clock: string;
  note?: "tarde" | "muy tarde";
}

/** Events in arrival order. */
export const EVENTS: readonly EventDef[] = [
  { id: "e1", clock: "12:04" },
  { id: "e2", clock: "12:14" },
  { id: "e3", clock: "12:07", note: "tarde" as const },
  { id: "e4", clock: "12:25" },
  { id: "e5", clock: "12:03", note: "muy tarde" as const },
].map((e) => ({ ...e, time: parseClock(e.clock) }));

export type Outcome = "aceptado" | "descartado";

export interface EventOutcome {
  event: EventDef;
  status: Outcome;
  windowIndex: number;
  /** watermark when the event arrived (null = −∞) */
  watermarkBefore: number | null;
  watermarkAfter: number;
  maxEventTime: number;
  /** stacking row inside its window (accepted events only, else -1) */
  row: number;
}

export type WindowStatus = "vacía" | "abierta" | "cerrada";

export interface WindowState extends WindowDef {
  count: number;
  closed: boolean;
  /** step at which the window closed (1-based event index), or null */
  closedAtStep: number | null;
  status: WindowStatus;
}

export interface WatermarkSnapshot {
  step: number;
  threshold: Threshold;
  outcomes: EventOutcome[];
  windows: WindowState[];
  /** null before the first event */
  maxEventTime: number | null;
  /** null = −∞ (displayed as "—") */
  watermark: number | null;
  /** windows holding state in memory (with data and not closed) */
  openWindows: number;
}

export function windowIndexOf(time: number): number {
  return Math.floor((time - WINDOWS[0].start) / WINDOW_MINUTES);
}

/** State after `step` events have arrived (0..5) with the given threshold. */
export function simulateWatermark(threshold: Threshold, step: number): WatermarkSnapshot {
  const n = Math.min(Math.max(Math.trunc(step), 0), EVENTS.length);
  let maxEventTime: number | null = null;
  let watermark: number | null = null;
  const counts = WINDOWS.map(() => 0);
  const rows = WINDOWS.map(() => 0);
  const closedAt: Array<number | null> = WINDOWS.map(() => null);
  const outcomes: EventOutcome[] = [];

  for (let i = 0; i < n; i++) {
    const event = EVENTS[i];
    const w = windowIndexOf(event.time);
    const watermarkBefore = watermark;

    // 1. Closed window (watermark >= window end) → dropped; open → counted.
    const isClosed = watermarkBefore !== null && watermarkBefore >= WINDOWS[w].end;
    let row = -1;
    if (!isClosed) {
      counts[w] += 1;
      row = rows[w];
      rows[w] += 1;
    }

    // 2. Advance max event time and watermark.
    maxEventTime = maxEventTime === null ? event.time : Math.max(maxEventTime, event.time);
    const wm = maxEventTime - threshold;
    watermark = wm;

    // 3. Close every window with end <= watermark (its state is freed).
    WINDOWS.forEach((win, wi) => {
      if (closedAt[wi] === null && win.end <= wm) closedAt[wi] = i + 1;
    });

    outcomes.push({
      event,
      status: isClosed ? "descartado" : "aceptado",
      windowIndex: w,
      watermarkBefore,
      watermarkAfter: wm,
      maxEventTime,
      row,
    });
  }

  const windows: WindowState[] = WINDOWS.map((win, wi) => {
    const closed = closedAt[wi] !== null;
    return {
      ...win,
      count: counts[wi],
      closed,
      closedAtStep: closedAt[wi],
      status: closed ? "cerrada" : counts[wi] > 0 ? "abierta" : "vacía",
    };
  });

  return {
    step: n,
    threshold,
    outcomes,
    windows,
    maxEventTime,
    watermark,
    openWindows: windows.filter((w) => w.status === "abierta").length,
  };
}

/** "12:04", or "—" for −∞ / not yet defined. */
export function formatMaybeClock(minutes: number | null): string {
  return minutes === null ? "—" : formatClock(minutes);
}
