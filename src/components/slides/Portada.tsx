"use client";

import type { CSSProperties } from "react";
import { useAmbient } from "@/components/deck/SlideEnv";
import { cx } from "@/components/ui/primitives";

/** Deterministic ambient: a few horizontal lanes with data points flowing left → right. */
const LANES = [
  { y: 140, dots: 3, duration: 14, tone: "bg-accent" },
  { y: 270, dots: 2, duration: 11, tone: "bg-info" },
  { y: 780, dots: 3, duration: 16, tone: "bg-info" },
  { y: 960, dots: 3, duration: 18, tone: "bg-ok" },
] as const;

export function Portada() {
  const ambient = useAmbient();
  return (
    <div className={cx("absolute inset-0", !ambient && "ambient-off")}>
      <div className="absolute inset-0" aria-hidden>
        {LANES.map((lane, li) => (
          <div key={lane.y} className="absolute inset-x-0" style={{ top: lane.y }}>
            <div className="h-[2px] w-full bg-edge/70" />
            {Array.from({ length: lane.dots }, (_, di) => {
              const style = {
                "--flow-duration": `${lane.duration}s`,
                "--flow-delay": `${-((di * lane.duration) / lane.dots + li * 1.7)}s`,
                // static fallback positions (reduced motion / print)
                left: ambient ? 0 : 260 + ((di * 610 + li * 230) % 1500),
              } as CSSProperties;
              return (
                <span
                  key={di}
                  className={cx(
                    "flow-dot absolute -top-[7px] block h-[16px] w-[16px] rounded-full opacity-80",
                    lane.tone,
                  )}
                  style={style}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="absolute left-[160px] top-[380px] max-w-[1600px]">
        <div className="text-[30px] font-semibold uppercase tracking-[0.14em] text-accent">
          Big Data Aplicado · Actividad de investigación Spark
        </div>
        <h1 className="mt-[28px] text-display font-semibold tracking-[-0.035em] text-fg">
          Spark en tiempo real
        </h1>
        <div className="mt-[28px] text-[52px] font-medium text-muted">Structured Streaming y MLlib</div>
      </div>

      <div className="absolute bottom-[172px] left-[160px] flex items-center gap-[18px] text-body font-medium text-fg">
        <span className="block h-[14px] w-[14px] rounded-full bg-accent" aria-hidden />
        Grupo 6 · Vau y Onai
      </div>
    </div>
  );
}
