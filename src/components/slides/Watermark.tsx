"use client";

import { useState } from "react";
import { AnimatePresence, motion, type TargetAndTransition, type Transition } from "motion/react";
import { ChevronLeft, Lock, MemoryStick } from "lucide-react";
import { useSlideEnv } from "@/components/deck/SlideEnv";
import { EASE_OUT } from "@/components/ui/Reveal";
import { Segmented } from "@/components/ui/Segmented";
import { SlideTitle, cx } from "@/components/ui/primitives";
import { THRESHOLDS, formatClock, type Threshold } from "@/lib/sim/types";
import {
  EVENTS,
  WINDOWS,
  formatMaybeClock,
  simulateWatermark,
  type EventOutcome,
  type WindowState,
} from "@/lib/sim/watermark";
import type { SlideProps } from "./types";

/* ── Canvas geometry (1920×1080) ─────────────────────────────── */
const X0 = 120; // 12:00
const PX_PER_MIN = 39; // 12:30 → 1290
const T0 = WINDOWS[0].start;
const xOf = (minutes: number) => X0 + (minutes - T0) * PX_PER_MIN;

const BOX_TOP = 252;
const BOX_H = 330;
const AXIS_Y = 604;
const CHIP_W = 128;
const CHIP_H = 50;
const CHIP_ROW_Y = BOX_TOP + 146;
const CHIP_ROW_GAP = 58;
const QUEUE_X = 120;
const QUEUE_GAP = 232;
const QUEUE_Y = 800;
const SLOT_W = 200;
const DROP_FROM_Y = AXIS_Y - CHIP_H - 14;
const DROP_TO_Y = AXIS_Y + 70;
const PANEL_X = 1352;
const WM_MIN_X = X0 - 34;

const THRESHOLD_OPTIONS = THRESHOLDS.map((t, i) => ({
  value: t,
  label: `${t} min`,
  hint: `Tecla ${i + 1}`,
}));

function queueX(i: number) {
  return QUEUE_X + i * QUEUE_GAP + (SLOT_W - CHIP_W) / 2;
}

/* ── Event chip: one element per event, positioned absolutely ── */
function EventChip({
  index,
  outcome,
  isNext,
  windowClosed,
  live,
}: {
  index: number;
  outcome: EventOutcome | undefined;
  isNext: boolean;
  windowClosed: boolean;
  live: boolean;
}) {
  const event = EVENTS[index];
  const axisX = xOf(event.time) - CHIP_W / 2;
  const fly: Transition = live ? { duration: 0.7, ease: EASE_OUT } : { duration: 0 };

  let animate: TargetAndTransition;
  let transition: Transition = fly;
  let tone: string;
  if (!outcome) {
    animate = { x: queueX(index), y: QUEUE_Y + 7, opacity: 1 };
    tone = isNext ? "border-accent bg-surface text-fg" : "border-edge bg-surface text-fg";
  } else if (outcome.status === "aceptado") {
    animate = { x: axisX, y: CHIP_ROW_Y + outcome.row * CHIP_ROW_GAP, opacity: windowClosed ? 0.55 : 1 };
    tone = "border-ok bg-[color-mix(in_oklab,var(--ok)_18%,var(--surface))] text-fg";
  } else {
    animate = { x: axisX, y: [null, DROP_FROM_Y, DROP_TO_Y], opacity: [null, 1, 0] };
    transition = live
      ? {
          x: { duration: 0.7, ease: EASE_OUT },
          y: { duration: 1.9, times: [0, 0.4, 1], ease: "easeInOut" },
          opacity: { duration: 1.9, times: [0, 0.72, 1] },
        }
      : { duration: 0 };
    tone = "border-bad bg-[color-mix(in_oklab,var(--bad)_22%,var(--surface))] text-fg";
  }

  return (
    <motion.div
      className={cx(
        "absolute left-0 top-0 z-30 flex items-center justify-center rounded-[14px] border-2 font-mono text-data font-semibold tabular-nums",
        "transition-[background-color,border-color] delay-300 duration-300",
        tone,
      )}
      style={{ width: CHIP_W, height: CHIP_H }}
      initial={false}
      animate={animate}
      transition={transition}
    >
      {event.clock}
    </motion.div>
  );
}

/* ── Window box with its state and a "state freed" flash when it closes ── */
function WindowBox({ win, live }: { win: WindowState; live: boolean }) {
  // React pattern for reacting to a prop change during render (no effect needed).
  const [prevClosed, setPrevClosed] = useState(win.closed);
  const [freed, setFreed] = useState(0);
  if (prevClosed !== win.closed) {
    setPrevClosed(win.closed);
    if (win.closed) setFreed((n) => n + 1);
  }

  const left = xOf(win.start) + 6;
  const width = (win.end - win.start) * PX_PER_MIN - 12;
  const open = win.status === "abierta";
  const closed = win.status === "cerrada";

  return (
    <div
      className={cx(
        "absolute z-20 overflow-hidden rounded-[20px] border-[3px] transition-colors duration-500",
        open && "border-accent bg-accent/8",
        closed && "border-edge bg-edge/35",
        win.status === "vacía" && "border-dashed border-edge bg-transparent",
      )}
      style={{ left, top: BOX_TOP, width, height: BOX_H }}
    >
      <div className="flex items-start justify-between px-[22px] pt-[16px]">
        <div>
          <div className={cx("font-mono text-data", closed ? "text-muted" : "text-fg")}>{win.label}</div>
          <div
            className={cx(
              "mt-[6px] flex items-center gap-[8px] text-[24px] font-medium",
              open ? "text-accent" : "text-muted",
            )}
          >
            {closed && <Lock size={24} strokeWidth={2.25} aria-hidden />}
            {open ? "abierta · en memoria" : closed ? "cerrada" : "sin datos"}
          </div>
        </div>
        <motion.div
          key={win.count}
          className={cx("font-mono text-[64px] font-semibold leading-none tabular-nums", closed ? "text-muted" : "text-fg")}
          initial={live ? { scale: 1.35, opacity: 0.4 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: EASE_OUT, delay: live ? 0.45 : 0 }}
        >
          {win.count}
        </motion.div>
      </div>

      <AnimatePresence>
        {live && freed > 0 && closed && (
          <motion.div
            key={freed}
            className="pointer-events-none absolute inset-0 flex items-end justify-center pb-[18px]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.6, delay: 0.9, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-accent/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, delay: 0.35 }}
            />
            <motion.div
              className="relative flex items-center gap-[10px] rounded-full bg-accent px-[20px] py-[6px] text-[24px] font-semibold text-bg"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: -10, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45, ease: EASE_OUT }}
            >
              <MemoryStick size={26} aria-hidden /> memoria liberada
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Axis() {
  const ticks = Array.from({ length: 7 }, (_, i) => T0 + i * 5);
  return (
    <div aria-hidden>
      <div className="absolute h-[3px] bg-muted/70" style={{ left: X0, top: AXIS_Y, width: 30 * PX_PER_MIN }} />
      {ticks.map((t) => (
        <div key={t}>
          <div
            className="absolute w-[3px] bg-muted/70"
            style={{ left: xOf(t) - 1, top: AXIS_Y - (t % 10 === 0 ? 10 : 6), height: t % 10 === 0 ? 23 : 15 }}
          />
          <div
            className="absolute w-[100px] text-center font-mono text-[22px] text-muted"
            style={{ left: xOf(t) - 50, top: AXIS_Y + 18 }}
          >
            {formatClock(t)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Watermark({ step, threshold, onThreshold }: SlideProps) {
  const { animate: live } = useSlideEnv();
  const sim = simulateWatermark(threshold, step);
  const move: Transition = live ? { duration: 0.7, ease: EASE_OUT } : { duration: 0 };

  const wm = sim.watermark;
  const wmOffAxis = wm === null || wm < T0;
  const wmX = wm === null ? WM_MIN_X : Math.max(xOf(wm), WM_MIN_X);
  const maxX = sim.maxEventTime === null ? X0 : xOf(sim.maxEventTime);

  return (
    <>
      <SlideTitle>Watermark en acción</SlideTitle>

      {/* event-time windows on the axis */}
      {sim.windows.map((w) => (
        <WindowBox key={w.index} win={w} live={live} />
      ))}
      <Axis />

      {/* máx. event time marker (thin, muted) */}
      <motion.div
        className="pointer-events-none absolute top-0"
        style={{ left: 0 }}
        initial={false}
        animate={{ x: maxX, opacity: sim.maxEventTime === null ? 0 : 1 }}
        transition={move}
        aria-hidden
      >
        <div className="absolute w-0 border-l-2 border-dashed border-muted" style={{ top: BOX_TOP - 8, height: AXIS_Y - BOX_TOP + 16 }} />
        <div className="absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-bg px-[10px] text-[22px] text-muted" style={{ top: AXIS_Y + 82 }}>
          máx. event time
        </div>
      </motion.div>

      {/* watermark line */}
      <motion.div
        className="pointer-events-none absolute top-0 z-10"
        style={{ left: 0 }}
        initial={false}
        animate={{ x: wmX }}
        transition={move}
      >
        <motion.div
          className="absolute w-[5px] -translate-x-1/2 rounded-full bg-accent shadow-[0_0_18px_var(--accent)]"
          style={{ top: BOX_TOP - 22, height: AXIS_Y - BOX_TOP + 40 }}
          initial={false}
          animate={{ opacity: wm === null ? 0 : 1 }}
          transition={move}
        />
        <div
          className="absolute flex items-center gap-[6px] whitespace-nowrap rounded-full bg-accent px-[16px] py-[3px] font-mono text-[24px] font-semibold text-bg"
          style={{ top: BOX_TOP - 62, left: wmOffAxis ? -14 : 0, transform: wmOffAxis ? "none" : "translateX(-50%)" }}
        >
          {wmOffAxis && wm !== null && <ChevronLeft size={22} strokeWidth={3} aria-hidden />}
          watermark {formatMaybeClock(wm)}
        </div>
      </motion.div>

      {/* arrivals queue */}
      <div className="absolute text-[26px] font-semibold uppercase tracking-[0.12em] text-muted" style={{ left: QUEUE_X, top: QUEUE_Y - 82 }}>
        Llegadas
      </div>
      {EVENTS.map((e, i) => {
        const o = sim.outcomes[i];
        return (
          <div key={e.id} className="absolute" style={{ left: QUEUE_X + i * QUEUE_GAP, top: QUEUE_Y - 36, width: SLOT_W }}>
            <div className="flex h-[30px] items-center justify-center gap-[8px] text-[22px]">
              <span className="font-mono text-muted">{i + 1}</span>
              {e.note && <span className="font-medium text-accent">· {e.note}</span>}
            </div>
            <div className="mt-[6px] h-[64px] rounded-[16px] border-2 border-dashed border-edge" />
            <div
              className={cx(
                "mt-[8px] h-[32px] text-center text-[24px] font-semibold transition-opacity duration-300",
                o?.status === "aceptado" ? "text-ok" : "text-bad",
                o ? "opacity-100 delay-500" : "opacity-0",
              )}
            >
              {o?.status ?? ""}
            </div>
          </div>
        );
      })}
      {EVENTS.map((e, i) => {
        const o = sim.outcomes[i];
        return (
          <EventChip
            key={e.id}
            index={i}
            outcome={o}
            isNext={i === sim.step}
            windowClosed={o ? sim.windows[o.windowIndex].closed : false}
            live={live}
          />
        );
      })}

      {/* calculation panel */}
      <div
        className="absolute rounded-[20px] border-2 border-edge bg-surface px-[24px] py-[22px]"
        style={{ left: PANEL_X, top: BOX_TOP - 4, width: 1800 - PANEL_X }}
      >
        <div className="text-[24px] font-semibold uppercase tracking-[0.12em] text-muted">Cálculo</div>
        <div className="mt-[14px] space-y-[8px] font-mono text-data text-fg">
          <div>
            máx. event time = <span className="font-semibold">{formatMaybeClock(sim.maxEventTime)}</span>
          </div>
          <div>
            umbral = <span className="font-semibold">{threshold} min</span>
          </div>
          <div className="text-accent">
            watermark = <span className="font-semibold">{formatMaybeClock(wm)}</span>
          </div>
        </div>
        <div className="my-[20px] h-[2px] bg-edge" />
        <div className="text-[26px] font-medium text-fg">
          Memoria: {sim.openWindows} {sim.openWindows === 1 ? "ventana abierta" : "ventanas abiertas"}
        </div>
        <div className="mt-[14px] grid grid-cols-3 gap-[10px]" aria-hidden>
          {sim.windows.map((w) => (
            <div
              key={w.index}
              className={cx(
                "h-[26px] rounded-[8px] border-2 transition-colors duration-500",
                w.status === "abierta" ? "border-accent bg-accent" : "border-edge bg-transparent",
              )}
            />
          ))}
        </div>
        <div className="mt-[26px] text-[24px] font-medium text-muted">umbral</div>
        <Segmented<Threshold>
          className="mt-[8px]"
          ariaLabel="Umbral del watermark"
          options={THRESHOLD_OPTIONS}
          value={threshold}
          onChange={onThreshold}
        />
      </div>

      <div className="absolute text-[22px] italic text-muted" style={{ left: PANEL_X, top: 900 }}>
        Simplificación: 1 evento = 1 micro-batch
      </div>
    </>
  );
}
