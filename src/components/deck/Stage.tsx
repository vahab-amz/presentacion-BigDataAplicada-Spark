"use client";

import { useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

export const STAGE_W = 1920;
export const STAGE_H = 1080;

interface StageProps {
  children: ReactNode;
  className?: string;
  /** Click on the left/right half of the stage → -1 / +1 (ignored on interactive controls). */
  onNavigate?: (dir: 1 | -1) => void;
}

/**
 * Fixed 1920×1080 canvas scaled with transform: scale() to fit its container,
 * letterboxed and centered — identical layout on any projector.
 */
export function Stage({ children, className, onNavigate }: StageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = (w: number, h: number) =>
      setBox((b) => (b && b.w === w && b.h === h ? b : { w, h }));
    const rect = el.getBoundingClientRect();
    measure(rect.width, rect.height);
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) measure(r.width, r.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = box ? Math.min(box.w / STAGE_W, box.h / STAGE_H) : 0;
  const left = box ? (box.w - STAGE_W * scale) / 2 : 0;
  const top = box ? (box.h - STAGE_H * scale) / 2 : 0;

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onNavigate) return;
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest("button, a, input, select, textarea, [data-interactive]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onNavigate(e.clientX - rect.left < rect.width / 2 ? -1 : 1);
  };

  return (
    <div ref={ref} className={`relative h-full w-full overflow-hidden ${className ?? ""}`} onClick={onClick}>
      <div
        className="absolute origin-top-left overflow-hidden bg-bg"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          left,
          top,
          transform: `scale(${scale})`,
          visibility: box ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
