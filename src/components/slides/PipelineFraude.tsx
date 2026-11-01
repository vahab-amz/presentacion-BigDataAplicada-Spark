"use client";

import { motion, type Transition } from "motion/react";
import { ChevronRight, Save, ShieldAlert } from "lucide-react";
import { useSlideEnv } from "@/components/deck/SlideEnv";
import { EASE_OUT, Reveal } from "@/components/ui/Reveal";
import { cx, SlideTitle } from "@/components/ui/primitives";
import type { SlideProps } from "./types";

/* ── Geometry (1920×1080 canvas) ─────────────────────────────── */
const SLOT_X = [120, 540, 960, 1380]; // row card positions (before / after each station)
const CARD_W = 420;
const STATION_W = 392;
const STATION_TOP = 268;
const STATION_H = 150;
const TRACK_Y = 486;
const CARD_TOP = 520;
const LINE_H = 44;

interface Station {
  name: string;
  kind: "Estimator" | "Transformer";
  center: number;
}

const STATIONS: readonly Station[] = [
  { name: "StringIndexer", kind: "Estimator", center: 540 },
  { name: "VectorAssembler", kind: "Transformer", center: 960 },
  { name: "RandomForestClassifier", kind: "Estimator", center: 1380 },
];

interface Column {
  text: string;
  /** step at which the column is added */
  at: number;
}

const COLUMNS: readonly Column[] = [
  { text: "importe: 900", at: 0 },
  { text: "hora: 3", at: 0 },
  { text: 'pais: "BR"', at: 0 },
  { text: "pais_idx: 2", at: 1 },
  { text: "features: [900, 3, 2]", at: 2 },
  { text: "prediction: 1", at: 3 },
  { text: "probabilidad 0,93", at: 3 },
];

const MODEL_CENTER = 960;

export function PipelineFraude({ step }: SlideProps) {
  const { animate: live } = useSlideEnv();
  const t = (d: number, delay = 0): Transition => (live ? { duration: d, delay, ease: EASE_OUT } : { duration: 0 });
  const slot = Math.min(step, 3);
  const collapsed = step >= 4;

  return (
    <>
      <SlideTitle>Un Pipeline para fraude</SlideTitle>

      <div className="absolute left-[120px] top-[204px] font-mono text-[32px] font-semibold text-accent">
        pipeline.fit(histórico)
      </div>

      {/* stations */}
      {STATIONS.map((s, i) => {
        const passed = step >= i + 1;
        const justPassed = step === i + 1;
        return (
          <motion.div
            key={s.name}
            className={cx(
              "absolute flex flex-col items-center justify-center gap-[12px] rounded-[20px] border-[3px] bg-surface transition-[border-color,box-shadow] duration-500",
              justPassed
                ? "border-accent shadow-[0_0_40px_-8px_var(--accent)]"
                : passed
                  ? "border-accent/60"
                  : "border-edge",
            )}
            style={{ left: s.center - STATION_W / 2, top: STATION_TOP, width: STATION_W, height: STATION_H }}
            initial={false}
            animate={
              collapsed
                ? { x: MODEL_CENTER - s.center, opacity: 0, scale: 0.85 }
                : { x: 0, opacity: 1, scale: 1 }
            }
            transition={t(0.5)}
          >
            <span className="text-[30px] font-semibold text-fg">{s.name}</span>
            <span
              className={cx(
                "rounded-full px-[16px] py-[2px] font-mono text-[22px] font-semibold",
                s.kind === "Estimator" ? "bg-info/15 text-info" : "bg-ok/15 text-ok",
              )}
            >
              {s.kind}
            </span>
          </motion.div>
        );
      })}

      {/* StringIndexer mapping legend */}
      <Reveal
        show={step >= 1 && !collapsed}
        from="fade"
        className="absolute whitespace-nowrap text-center font-mono text-[22px] text-muted"
        style={{ left: STATIONS[0].center - STATION_W / 2, top: STATION_TOP + STATION_H + 10, width: STATION_W }}
      >
        ES → 0 · FR → 1 · BR → 2
      </Reveal>

      {/* step 4 · collapsed PipelineModel */}
      <Reveal
        show={collapsed}
        from="scale"
        delay={live ? 0.3 : 0}
        className="absolute"
        style={{ left: MODEL_CENTER - 420, top: STATION_TOP - 6, width: 840, height: STATION_H + 12 }}
      >
        <div className="flex h-full items-center gap-[28px] rounded-[24px] border-[3px] border-accent bg-accent/12 px-[40px] shadow-[0_0_50px_-12px_var(--accent)]">
          <span className="flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-[22px] bg-accent text-bg">
            <Save size={52} aria-hidden />
          </span>
          <div>
            <div className="font-mono text-[48px] font-semibold text-fg">PipelineModel</div>
            <div className="text-body text-muted">guardado · listo para streaming</div>
          </div>
        </div>
      </Reveal>

      {/* conveyor track */}
      <div className="absolute left-[120px] right-[120px]" style={{ top: TRACK_Y }} aria-hidden>
        <div className="h-[10px] rounded-full bg-edge" />
        <div className="absolute inset-x-0 -top-[13px] flex justify-around text-muted/70">
          {Array.from({ length: 12 }, (_, i) => (
            <ChevronRight key={i} size={36} strokeWidth={2.5} />
          ))}
        </div>
      </div>

      {/* the DataFrame row travelling along the conveyor */}
      <motion.div
        className="absolute left-0 rounded-[22px] border-[3px] border-edge bg-surface px-[24px] pb-[20px] pt-[14px] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)]"
        style={{ top: CARD_TOP, width: CARD_W }}
        initial={false}
        animate={{ x: SLOT_X[slot] }}
        transition={t(0.7)}
      >
        <div className="text-caption font-semibold uppercase tracking-[0.12em] text-muted">DataFrame · fila</div>
        <div className="mt-[6px]">
          {COLUMNS.map((c) => {
            const shown = step >= c.at;
            const fresh = c.at > 0 && step === c.at;
            return (
              <motion.div
                key={c.text}
                className="overflow-hidden"
                initial={false}
                animate={{ height: shown ? LINE_H : 0, opacity: shown ? 1 : 0 }}
                transition={t(0.4, shown && c.at > 0 ? 0.45 : 0)}
              >
                <div
                  className={cx(
                    "-mx-[10px] flex h-[40px] items-center rounded-[10px] px-[10px] font-mono text-data whitespace-nowrap transition-colors duration-500",
                    fresh ? "bg-accent/18 text-fg" : "text-fg/85",
                  )}
                >
                  {c.text}
                </div>
              </motion.div>
            );
          })}
        </div>
        <motion.div
          className="overflow-hidden"
          initial={false}
          animate={{ height: step >= 3 ? 64 : 0, opacity: step >= 3 ? 1 : 0 }}
          transition={t(0.4, step >= 3 ? 0.6 : 0)}
        >
          <div className="mt-[12px] inline-flex items-center gap-[10px] rounded-[12px] bg-bad px-[18px] py-[6px] text-[30px] font-bold tracking-[0.04em] text-white">
            <ShieldAlert size={30} aria-hidden /> FRAUDE
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
