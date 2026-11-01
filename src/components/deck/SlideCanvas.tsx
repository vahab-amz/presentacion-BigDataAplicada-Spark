"use client";

import type { SlideDef } from "@/content/slides";
import type { OutputMode, Threshold } from "@/lib/sim/types";
import { SLIDE_COMPONENTS } from "@/components/slides/registry";
import { SlideChrome } from "./SlideChrome";

export interface SlideCanvasProps {
  def: SlideDef;
  step: number;
  threshold: Threshold;
  outputMode: OutputMode;
  onThreshold: (t: Threshold) => void;
  onOutputMode: (m: OutputMode) => void;
}

/** One slide on the 1920×1080 canvas, with its chrome. */
export function SlideCanvas({ def, step, threshold, outputMode, onThreshold, onOutputMode }: SlideCanvasProps) {
  const Slide = SLIDE_COMPONENTS[def.component];
  return (
    <div className="absolute inset-0 overflow-hidden bg-bg text-fg" data-slide={def.id} data-step={step}>
      <Slide
        step={step}
        threshold={threshold}
        outputMode={outputMode}
        onThreshold={onThreshold}
        onOutputMode={onOutputMode}
      />
      <SlideChrome def={def} step={step} />
    </div>
  );
}

const noop = () => {};

/** Non-interactive render of a slide at a given position (print, presenter preview). */
export function StaticSlide({
  def,
  step,
  threshold,
  outputMode,
}: {
  def: SlideDef;
  step: number;
  threshold: Threshold;
  outputMode: OutputMode;
}) {
  return (
    <SlideCanvas
      def={def}
      step={step}
      threshold={threshold}
      outputMode={outputMode}
      onThreshold={noop}
      onOutputMode={noop}
    />
  );
}
