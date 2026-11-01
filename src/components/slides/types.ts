import type { OutputMode, Threshold } from "@/lib/sim/types";

/** Every slide is a pure function of (step, local controls). */
export interface SlideProps {
  step: number;
  threshold: Threshold;
  outputMode: OutputMode;
  onThreshold: (t: Threshold) => void;
  onOutputMode: (m: OutputMode) => void;
}
