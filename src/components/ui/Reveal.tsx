"use client";

import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { useSlideEnv } from "@/components/deck/SlideEnv";

type From = "up" | "down" | "left" | "right" | "scale" | "fade";

const OFFSETS: Record<From, { x: number; y: number; scale: number }> = {
  up: { x: 0, y: 28, scale: 1 },
  down: { x: 0, y: -28, scale: 1 },
  left: { x: -40, y: 0, scale: 1 },
  right: { x: 40, y: 0, scale: 1 },
  scale: { x: 0, y: 0, scale: 0.94 },
  fade: { x: 0, y: 0, scale: 1 },
};

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  show: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  from?: From;
  delay?: number;
}

/** Step reveal: fades/slides in when `show`; already-revealed elements stay. Keeps its layout box. */
export function Reveal({ show, children, className, style, from = "up", delay = 0 }: RevealProps) {
  const { animate } = useSlideEnv();
  if (!animate) {
    return (
      <div className={className} style={{ ...style, opacity: show ? 1 : 0 }} aria-hidden={!show}>
        {children}
      </div>
    );
  }
  const off = OFFSETS[from];
  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={show ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, ...off }}
      transition={{ duration: 0.3, ease: EASE_OUT, delay: show ? delay : 0 }}
      aria-hidden={!show}
    >
      {children}
    </motion.div>
  );
}
