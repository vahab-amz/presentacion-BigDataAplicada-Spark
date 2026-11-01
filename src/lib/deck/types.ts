import type { OutputMode, Threshold } from "../sim/types";

export type Theme = "dark" | "light";
export type Speaker = "Vau" | "Onai";

export interface Position {
  /** 1-based slide number */
  slide: number;
  /** 0-based step within the slide */
  step: number;
}

export interface DeckState extends Position {
  theme: Theme;
  threshold: Threshold;
  outputMode: OutputMode;
}

/** Message exchanged between `/` and `/presenter`. */
export type DeckMessage =
  | ({ type: "state"; sender: string } & DeckState)
  | { type: "hello"; sender: string };

export const CHANNEL_NAME = "spark-g6-deck";
export const THEME_STORAGE_KEY = "spark-g6-theme";
