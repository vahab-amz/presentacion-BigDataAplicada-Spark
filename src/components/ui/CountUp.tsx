"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useSlideEnv } from "@/components/deck/SlideEnv";

interface CountUpProps {
  /** Target value; changes animate from the current value. Mounting shows it directly. */
  value: number;
  /** Must be a stable (module-level) function. */
  format: (v: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
}

/** Animated number, driven by a motion value (no re-render per frame). */
export function CountUp({ value, format, duration = 1, delay = 0, className }: CountUpProps) {
  const { animate: live } = useSlideEnv();
  const mv = useMotionValue(value);
  const text = useTransform(mv, format);

  useEffect(() => {
    if (!live) {
      mv.jump(value);
      return;
    }
    const controls = animate(mv, value, { duration, delay, ease: "easeOut" });
    return () => controls.stop();
  }, [value, live, mv, duration, delay]);

  return <motion.span className={className}>{text}</motion.span>;
}

export const formatInt = (v: number) => String(Math.round(v));
export const formatTimes = (v: number) => `×${Math.round(v)}`;
export const formatDecimal2 = (v: number) => v.toFixed(2).replace(".", ",");
