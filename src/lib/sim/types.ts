/** Watermark threshold presets (minutes) used on slide 7. */
export const THRESHOLDS = [2, 10, 20] as const;
export type Threshold = (typeof THRESHOLDS)[number];
export const DEFAULT_THRESHOLD: Threshold = 10;

/** Structured Streaming output modes used on slide 5. */
export const OUTPUT_MODES = ["append", "update", "complete"] as const;
export type OutputMode = (typeof OUTPUT_MODES)[number];
export const DEFAULT_OUTPUT_MODE: OutputMode = "update";

/** Minutes since midnight → "HH:MM". */
export function formatClock(minutes: number): string {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "12:04" → minutes since midnight. */
export function parseClock(clock: string): number {
  const [h, m] = clock.split(":").map(Number);
  return h * 60 + m;
}
