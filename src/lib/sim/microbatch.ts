import { formatClock, parseClock, type OutputMode } from "./types";

/**
 * Slide 5 · micro-batch stepper (pure, deterministic, step-driven).
 * Query: groupBy(window(event_time, "5 min")).count()
 */

export const WINDOW_MINUTES = 5;

/** Events per micro-batch (step 1 = micro-batch 1, step 2 = micro-batch 2). */
export const MICROBATCHES: readonly (readonly string[])[] = [["12:01", "12:02", "12:06"], ["12:07"]];

export const APPEND_WARNING = "append + agregación requiere watermark";

export interface InputRow {
  clock: string;
  time: number;
  /** 1-based micro-batch that brought the row */
  batch: number;
}

export interface ResultRow {
  start: number;
  end: number;
  /** "12:00–12:05" */
  label: string;
  count: number;
}

export type SinkOutput = { kind: "rows"; rows: ResultRow[] } | { kind: "warning"; message: string };

export interface MicrobatchSnapshot {
  step: number;
  /** current micro-batch (0 = none yet) */
  batch: number;
  input: InputRow[];
  /** full result table, ordered by window start */
  result: ResultRow[];
  /** labels of result rows created or updated by the current micro-batch */
  changed: string[];
  /** events processed by the current micro-batch */
  processed: number;
  /** what the sink writes for the current micro-batch in the given output mode */
  sink: SinkOutput;
}

/** All input rows, in arrival order. */
export const ALL_INPUT: readonly InputRow[] = MICROBATCHES.flatMap((events, b) =>
  events.map((clock) => ({ clock, time: parseClock(clock), batch: b + 1 })),
);

export function windowLabel(start: number): string {
  return `${formatClock(start)}–${formatClock(start + WINDOW_MINUTES)}`;
}

export function formatResultRow(row: ResultRow): string {
  return `${row.label} → ${row.count}`;
}

export function simulateMicrobatch(step: number, mode: OutputMode): MicrobatchSnapshot {
  const batch = Math.min(Math.max(Math.trunc(step), 0), MICROBATCHES.length);
  const input = ALL_INPUT.filter((r) => r.batch <= batch);

  const counts = new Map<number, number>();
  for (const r of input) {
    const start = Math.floor(r.time / WINDOW_MINUTES) * WINDOW_MINUTES;
    counts.set(start, (counts.get(start) ?? 0) + 1);
  }
  const result: ResultRow[] = [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([start, count]) => ({ start, end: start + WINDOW_MINUTES, label: windowLabel(start), count }));

  const current = input.filter((r) => r.batch === batch);
  const changed = [
    ...new Set(current.map((r) => windowLabel(Math.floor(r.time / WINDOW_MINUTES) * WINDOW_MINUTES))),
  ];

  let sink: SinkOutput;
  if (mode === "append") {
    // Streaming aggregations in append mode need a watermark to know when a window is final.
    sink = { kind: "warning", message: APPEND_WARNING };
  } else if (batch === 0) {
    sink = { kind: "rows", rows: [] };
  } else if (mode === "complete") {
    sink = { kind: "rows", rows: result };
  } else {
    sink = { kind: "rows", rows: result.filter((r) => changed.includes(r.label)) };
  }

  return { step: batch, batch, input, result, changed, processed: current.length, sink };
}
