import type { Position } from "./types";

/**
 * Pure navigation over a deck described by `stepsOf` (steps per slide,
 * index 0 = slide 1). A slide with `steps = n` has positions 0..n.
 */

export function clampPosition(pos: Position, stepsOf: readonly number[]): Position {
  const total = stepsOf.length;
  const slide = Math.min(Math.max(Math.trunc(pos.slide) || 1, 1), total);
  const maxStep = stepsOf[slide - 1];
  const step = Math.min(Math.max(Math.trunc(pos.step) || 0, 0), maxStep);
  return { slide, step };
}

export function nextPosition(pos: Position, stepsOf: readonly number[]): Position {
  const { slide, step } = clampPosition(pos, stepsOf);
  if (step < stepsOf[slide - 1]) return { slide, step: step + 1 };
  if (slide < stepsOf.length) return { slide: slide + 1, step: 0 };
  return { slide, step };
}

export function prevPosition(pos: Position, stepsOf: readonly number[]): Position {
  const { slide, step } = clampPosition(pos, stepsOf);
  if (step > 0) return { slide, step: step - 1 };
  if (slide > 1) return { slide: slide - 1, step: stepsOf[slide - 2] };
  return { slide, step };
}

export function isLastPosition(pos: Position, stepsOf: readonly number[]): boolean {
  const { slide, step } = clampPosition(pos, stepsOf);
  return slide === stepsOf.length && step === stepsOf[slide - 1];
}

export function samePosition(a: Position, b: Position): boolean {
  return a.slide === b.slide && a.step === b.step;
}

/** `#/7/3` → { slide: 7, step: 3 } (clamped). Returns null when unparseable. */
export function parseHash(hash: string, stepsOf: readonly number[]): Position | null {
  const match = /^#?\/?(\d+)(?:\/(\d+))?\/?$/.exec(hash.trim());
  if (!match) return null;
  return clampPosition(
    { slide: Number(match[1]), step: match[2] === undefined ? 0 : Number(match[2]) },
    stepsOf,
  );
}

export function formatHash(pos: Position): string {
  return `#/${pos.slide}/${pos.step}`;
}

/** Overall progress in [0, 1] for the top progress bar. */
export function progressOf(pos: Position, stepsOf: readonly number[]): number {
  const { slide, step } = clampPosition(pos, stepsOf);
  const steps = stepsOf[slide - 1];
  const within = steps === 0 ? 1 : step / steps;
  return (slide - 1 + within) / stepsOf.length;
}
