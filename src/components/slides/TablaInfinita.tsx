"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAmbient } from "@/components/deck/SlideEnv";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightLine, Content, SlideTitle, cx } from "@/components/ui/primitives";
import type { SlideProps } from "./types";

type Kind = "pago" | "clic" | "sensor";

const PATTERN: readonly Kind[] = ["pago", "clic", "sensor", "clic", "pago", "clic", "sensor"];
const KIND_TONE: Record<Kind, string> = {
  pago: "border-accent text-accent bg-accent/12",
  clic: "border-info text-info bg-info/12",
  sensor: "border-ok text-ok bg-ok/12",
};

/** Deterministic row n of the (endless) input table. */
function rowAt(n: number): { time: string; kind: Kind; value: string } {
  const secs = 12 * 3600 + n * 4;
  const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const kind = PATTERN[n % PATTERN.length];
  const value =
    kind === "pago"
      ? `${12 + ((n * 17) % 80)},${(n * 7) % 10}0 €`
      : kind === "clic"
        ? ["/home", "/pagar", "/login", "/perfil"][n % 4]
        : `21,${(n * 3) % 10} °C`;
  return { time: `${hh}:${mm}:${ss}`, kind, value };
}

const VISIBLE_ROWS = 7;
const ROW_H = 62;
const TICK_MS = 1500;

const CHIP_LANES: ReadonlyArray<{ kind: Kind; top: number; duration: number; delay: number }> = [
  { kind: "pago", top: 150, duration: 4.5, delay: 0 },
  { kind: "clic", top: 260, duration: 3.6, delay: -1.2 },
  { kind: "sensor", top: 370, duration: 5.2, delay: -2.6 },
  { kind: "pago", top: 480, duration: 4.1, delay: -3.1 },
];

const BULLETS = [
  "Cada evento = una fila nueva",
  "Mismo código que en batch: DataFrame / SQL",
  "Spark procesa solo lo nuevo: micro-batches + estado",
];

function useTicker(active: boolean, ms: number): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [active, ms]);
  return active ? tick : 0;
}

export function TablaInfinita({ step }: SlideProps) {
  const ambient = useAmbient();
  const first = useTicker(ambient, TICK_MS);
  const rows = Array.from({ length: VISIBLE_ROWS }, (_, i) => first + i);

  return (
    <>
      <SlideTitle>El stream como tabla infinita</SlideTitle>
      <Content className={cx(!ambient && "ambient-off")}>
        {/* Event stream lane */}
        <div className="absolute left-0 top-0 h-[620px] w-[400px]">
          <div className="text-caption font-semibold uppercase tracking-[0.12em] text-muted">Stream de eventos</div>
          {CHIP_LANES.map((lane, i) => (
            <div key={i} className="absolute left-0 right-0" style={{ top: lane.top }}>
              <div className="absolute left-0 right-[40px] top-[26px] h-[2px] bg-edge/70" />
              <span
                className={cx(
                  "flow-chip absolute left-0 top-0 inline-flex h-[54px] items-center rounded-full border-2 px-[22px] font-mono text-data",
                  KIND_TONE[lane.kind],
                )}
                style={
                  {
                    "--flow-to": "250px",
                    "--flow-duration": `${lane.duration}s`,
                    "--flow-delay": `${lane.delay}s`,
                    transform: ambient ? undefined : `translateX(${(i * 70) % 200}px)`,
                  } as CSSProperties
                }
              >
                {lane.kind}
              </span>
            </div>
          ))}
          <ArrowRightLine width={64} className="absolute right-[-8px] top-[300px] text-accent" />
        </div>

        {/* Input table, ever growing at the bottom (recycled DOM rows) */}
        <div className="absolute left-[440px] top-0 w-[620px]">
          <div className="flex items-center gap-[12px] text-caption font-semibold uppercase tracking-[0.12em] text-accent">
            <span className="pulse-soft block h-[12px] w-[12px] rounded-full bg-accent" aria-hidden />
            Input table · sin fin
          </div>
          <div className="mt-[16px] overflow-hidden rounded-[18px] border-2 border-edge bg-surface">
            <div className="grid h-[62px] grid-cols-[230px_160px_1fr] items-center border-b-2 border-edge px-[28px] font-mono text-[24px] text-muted">
              <span>event_time</span>
              <span>tipo</span>
              <span>valor</span>
            </div>
            <div className="relative overflow-hidden" style={{ height: VISIBLE_ROWS * ROW_H }}>
              <AnimatePresence initial={false}>
                {rows.map((n, i) => {
                  const r = rowAt(n);
                  const newest = ambient && i === VISIBLE_ROWS - 1;
                  return (
                    <motion.div
                      key={n}
                      className={cx(
                        "absolute inset-x-0 top-0 grid grid-cols-[230px_160px_1fr] items-center border-b border-edge/70 px-[28px] font-mono text-data",
                        newest ? "bg-accent/10 text-fg" : "text-fg/90",
                      )}
                      style={{ height: ROW_H }}
                      initial={{ opacity: 0, y: VISIBLE_ROWS * ROW_H }}
                      animate={{ opacity: 1, y: i * ROW_H }}
                      exit={{ opacity: 0, y: -ROW_H }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <span className="tabular-nums">{r.time}</span>
                      <span className={KIND_TONE[r.kind].split(" ")[1]}>{r.kind}</span>
                      <span className="text-muted">{r.value}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="flex h-[52px] items-center justify-center font-mono text-data text-muted">⋮</div>
          </div>
        </div>

        {/* Bullets, one per step */}
        <div className="absolute left-[1120px] right-0 top-[40px] flex flex-col gap-[44px]">
          {BULLETS.map((text, i) => (
            <Reveal key={text} show={step >= i + 1} from="left">
              <div className="flex gap-[22px] text-[36px] font-medium leading-[1.3] text-fg">
                <span className="mt-[6px] flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[24px] font-semibold text-bg">
                  {i + 1}
                </span>
                <span>{text}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Content>
    </>
  );
}
