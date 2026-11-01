"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { BrainCircuit, Landmark, Lock, Radio, Siren, Timer, UserRound } from "lucide-react";
import { useAmbient, useSlideEnv } from "@/components/deck/SlideEnv";
import { CountUp, formatDecimal2, formatInt, formatTimes } from "@/components/ui/CountUp";
import { EASE_OUT, Reveal } from "@/components/ui/Reveal";
import { ArrowRightLine, SlideTitle, cx } from "@/components/ui/primitives";
import type { SlideProps } from "./types";

/* ── Deterministic Kafka feed ──────────────────────────────────── */
const NORMAL_PAYMENTS = [
  "03:13:34 · 9,95 € · ES",
  "03:13:41 · 23,90 € · ES",
  "03:13:47 · 6,50 € · ES",
  "03:13:52 · 12,40 € · ES",
  "03:13:58 · 4,10 € · ES",
  "03:14:05 · 31,00 € · ES",
  "03:14:12 · 2,60 € · ES",
  "03:14:16 · 18,30 € · ES",
] as const;

const FEED_ROW_H = 60;
const FEED_VISIBLE = 9;
const FEED_START = 3; // rows already visible when the slide opens
const FEED_TICK_MS = 1600;

/** Window of the feed: ambient reveal at step 0, then frozen on the suspicious payment. */
function useFeedCount(active: boolean): number {
  const [count, setCount] = useState(FEED_START);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setCount((c) => (c >= NORMAL_PAYMENTS.length ? c : c + 1));
    }, FEED_TICK_MS);
    return () => window.clearInterval(id);
  }, [active]);
  return active ? count : NORMAL_PAYMENTS.length;
}

const WINDOW_COUNTS = [1, 2, 3, 4, 5, 6];
const WINDOW_LIMIT = 5;
const BAR_STAGGER = 0.24;
const CROSS_DELAY = BAR_STAGGER * WINDOW_COUNTS.length + 0.15;

/* ── Gauge (semicircle) ───────────────────────────────────────── */
const GAUGE_R = 120;
const GAUGE_ARC = `M ${150 - GAUGE_R} 150 A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${150 + GAUGE_R} 150`;

function Gauge({ value, live }: { value: number; live: boolean }) {
  return (
    <div className="relative mx-auto h-[176px] w-[300px]">
      <svg viewBox="0 0 300 170" className="absolute inset-0 h-[170px] w-[300px]" aria-hidden>
        <path d={GAUGE_ARC} fill="none" stroke="var(--border)" strokeWidth={24} strokeLinecap="round" />
        <motion.path
          d={GAUGE_ARC}
          fill="none"
          stroke="var(--bad)"
          strokeWidth={24}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: value, opacity: value > 0 ? 1 : 0 }}
          transition={live ? { duration: 1.1, ease: "easeOut" } : { duration: 0 }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-[6px] text-center font-mono text-[56px] font-semibold leading-none text-fg">
        <CountUp value={value} format={formatDecimal2} duration={1.1} />
      </div>
    </div>
  );
}

function Stage({
  lit,
  icon,
  title,
  children,
  className,
}: {
  lit: boolean;
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-[22px] border-[3px] px-[28px] py-[20px] transition-[opacity,border-color,background-color,box-shadow] duration-500",
        lit
          ? "border-accent bg-accent/10 opacity-100 shadow-[0_0_44px_-10px_var(--accent)]"
          : "border-edge bg-surface opacity-45",
        className,
      )}
    >
      <div className="flex items-center gap-[14px] text-[32px] font-semibold text-fg">
        <span className={lit ? "text-accent" : "text-muted"}>{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

function AlertCard({ show, label, delay, compact = false }: { show: boolean; label: string; delay: number; compact?: boolean }) {
  return (
    <Reveal show={show} from="scale" delay={delay}>
      <div
        className={cx(
          "flex items-center gap-[14px] rounded-[18px] border-[3px] border-bad bg-bad font-bold tracking-[0.02em] text-white shadow-[0_0_40px_-8px_var(--bad)]",
          compact ? "px-[18px] py-[12px] text-[26px] leading-tight" : "px-[22px] py-[14px] text-[28px]",
        )}
      >
        <Siren size={34} strokeWidth={2.25} aria-hidden />
        {label}
      </div>
    </Reveal>
  );
}

/* ── Phone mockup (generic) ───────────────────────────────────── */
function Phone({ notify, live }: { notify: boolean; live: boolean }) {
  const enter: Transition = live ? { type: "spring", stiffness: 260, damping: 22 } : { duration: 0 };
  return (
    <motion.div
      className="absolute left-[1344px] top-[204px] h-[540px] w-[336px] rounded-[52px] border-[10px] border-[#2a3446] bg-[#05080e] p-[10px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
      initial={false}
      animate={notify && live ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
      transition={live ? { duration: 0.5, delay: 0.35 } : { duration: 0 }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[38px] bg-[linear-gradient(160deg,#1b2740_0%,#0b1220_55%,#05080e_100%)] text-white">
        <div className="absolute left-1/2 top-[12px] h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-black" />
        <div className="mt-[46px] flex justify-center text-white/70">
          <Lock size={22} aria-hidden />
        </div>
        <div className="mt-[2px] text-center text-[92px] font-semibold leading-none tracking-[-0.03em]">3:14</div>
        <AnimatePresence initial={false}>
          {notify && (
            <motion.div
              key="push"
              className="absolute inset-x-[10px] top-[164px] rounded-[24px] bg-white/14 p-[14px] backdrop-blur-md"
              initial={{ y: -150, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -150, opacity: 0 }}
              transition={enter}
            >
              <div className="flex items-center gap-[10px] text-[22px]">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#FF6A1A] text-white">
                  <Landmark size={20} aria-hidden />
                </span>
                <span className="whitespace-nowrap font-semibold">Banco Demo</span>
                <span className="ml-auto text-[18px] text-white/60">ahora</span>
              </div>
              <div className="mt-[10px] text-[23px] font-medium leading-[1.3]">
                ¿Has realizado este pago de 900 € en Brasil?
              </div>
              <div className="mt-[14px] flex flex-col gap-[8px] text-[22px] font-semibold">
                <span className="rounded-[12px] bg-white/18 py-[8px] text-center">Sí, fui yo</span>
                <span className="rounded-[12px] bg-[#EF4444] py-[8px] text-center">No, bloquear tarjeta</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Sliding-window chart ─────────────────────────────────────── */
const CHART_H = 132;
const UNIT = CHART_H / 6.6;

function WindowChart({ active, live }: { active: boolean; live: boolean }) {
  return (
    <div
      className={cx(
        "absolute left-[1220px] top-[776px] w-[292px] transition-opacity duration-500",
        active ? "opacity-100" : "opacity-45",
      )}
    >
      <div className="flex items-end justify-between">
        <div className="text-[22px] font-medium leading-tight text-muted">Compras en los últimos 2 min</div>
        <CountUp
          value={active ? WINDOW_COUNTS.length : 0}
          format={formatInt}
          duration={BAR_STAGGER * WINDOW_COUNTS.length}
          delay={0.1}
          className={cx("ml-[10px] font-mono text-[48px] font-semibold leading-none", active ? "text-bad" : "text-fg")}
        />
      </div>
      <div className="relative mt-[10px] border-b-2 border-muted/70" style={{ height: CHART_H }}>
        {/* threshold line at 5 */}
        <div className="absolute inset-x-0 border-t-[3px] border-dashed border-accent" style={{ bottom: WINDOW_LIMIT * UNIT }} />
        <div className="absolute right-0 font-mono text-[22px] text-accent" style={{ bottom: WINDOW_LIMIT * UNIT + 4 }}>
          5
        </div>
        <div className="absolute inset-x-[6px] bottom-0 flex items-end gap-[14px]">
          {WINDOW_COUNTS.map((c, i) => (
            <motion.div
              key={c}
              className={cx("w-[34px] origin-bottom rounded-t-[6px]", c > WINDOW_LIMIT ? "bg-bad" : "bg-info")}
              style={{ height: c * UNIT }}
              initial={false}
              animate={{ scaleY: active ? 1 : 0, opacity: active ? 1 : 0 }}
              transition={live ? { duration: 0.22, delay: active ? 0.1 + i * BAR_STAGGER : 0, ease: EASE_OUT } : { duration: 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ViajePago({ step }: SlideProps) {
  const { animate: live } = useSlideEnv();
  const ambient = useAmbient();
  const count = useFeedCount(ambient && step === 0);

  const suspicious = step >= 1;
  const normals = NORMAL_PAYMENTS.slice(0, count);
  const visibleNormals = normals.slice(-(suspicious ? FEED_VISIBLE - 2 : FEED_VISIBLE));
  const rowTransition: Transition = live ? { duration: 0.5, ease: "easeOut" } : { duration: 0 };

  return (
    <>
      <SlideTitle>3:14 · el viaje de un pago</SlideTitle>

      {/* step 5 · big clock */}
      <Reveal show={step >= 5} from="scale" delay={live ? CROSS_DELAY : 0} className="absolute right-[120px] top-[78px]">
        <div className="flex items-center gap-[16px] rounded-[20px] border-[3px] border-ok bg-ok/12 px-[26px] py-[12px] text-[46px] font-semibold text-fg">
          <Timer size={50} className="text-ok" aria-hidden />
          Detectado en <span className="font-mono text-ok">1,8 s</span>
        </div>
      </Reveal>

      {/* ── Left · Kafka feed ── */}
      <div className="absolute left-[120px] top-[214px] w-[520px]">
        <div className="flex items-center gap-[12px] text-[28px] font-semibold text-fg">
          <Radio size={30} className="text-info" aria-hidden />
          Kafka · topic pagos
          <span className="pulse-soft ml-auto block h-[12px] w-[12px] rounded-full bg-ok" aria-hidden />
        </div>
        <div
          className="relative mt-[14px] overflow-hidden rounded-[20px] border-2 border-edge bg-surface"
          style={{ height: FEED_VISIBLE * FEED_ROW_H + 8 }}
        >
          <AnimatePresence initial={false}>
            {visibleNormals.map((p, i) => (
              <motion.div
                key={p}
                className="absolute inset-x-0 top-[4px] flex items-center justify-between border-b border-edge/60 px-[16px] font-mono text-data text-fg/90"
                style={{ height: FEED_ROW_H }}
                initial={{ opacity: 0, y: FEED_VISIBLE * FEED_ROW_H }}
                animate={{ opacity: suspicious ? 0.6 : 1, y: i * FEED_ROW_H }}
                exit={{ opacity: 0, y: -FEED_ROW_H }}
                transition={rowTransition}
              >
                <span className="whitespace-nowrap">{p}</span>
                <span className="rounded-[8px] bg-ok/15 px-[10px] text-[22px] font-semibold text-ok">OK</span>
              </motion.div>
            ))}
            {suspicious && (
              <motion.div
                key="suspicious"
                className="absolute inset-x-[6px] top-[4px] rounded-[16px] border-[3px] border-accent bg-accent/15 px-[12px] py-[6px] font-mono text-data font-semibold text-fg shadow-[0_0_36px_-6px_var(--accent)]"
                style={{ height: FEED_ROW_H * 2 - 6 }}
                initial={live ? { opacity: 0, y: FEED_VISIBLE * FEED_ROW_H, scale: 0.96 } : false}
                animate={{ opacity: 1, y: (FEED_VISIBLE - 2) * FEED_ROW_H + 2, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={rowTransition}
              >
                <div className="whitespace-nowrap">03:14:20 · 900 € · BR</div>
                <div className="whitespace-nowrap text-accent">tarjeta ****4821</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* connectors */}
      <div className={cx("absolute left-[650px] top-[318px] transition-opacity duration-500", step >= 2 ? "opacity-100" : "opacity-25")}>
        <ArrowRightLine width={44} className="text-accent" />
      </div>
      <div className={cx("absolute left-[1172px] top-[452px] transition-opacity duration-500", step >= 4 ? "opacity-100" : "opacity-25")}>
        <ArrowRightLine width={160} className="text-accent" />
      </div>

      {/* ── Center · pipeline stages ── */}
      <div className="absolute left-[702px] top-[214px] flex w-[456px] flex-col gap-[22px]">
        <Stage lit={step >= 2} icon={<UserRound size={34} aria-hidden />} title="Join perfil del cliente">
          <div className="mt-[12px] font-mono text-data text-fg">gasto medio: 45 €</div>
          <div className="mt-[6px] flex items-baseline gap-[16px]">
            <span className="font-mono text-data text-muted">ratio</span>
            <CountUp
              value={step >= 2 ? 20 : 1}
              format={formatTimes}
              duration={1.2}
              delay={0.2}
              className={cx("font-mono text-[60px] font-semibold leading-none", step >= 2 ? "text-accent" : "text-fg")}
            />
            <span className="font-mono text-[22px] text-muted">900 € / 45 €</span>
          </div>
        </Stage>

        <Stage lit={step >= 3} icon={<BrainCircuit size={34} aria-hidden />} title="Modelo">
          <div className="mt-[6px]">
            <Gauge value={step >= 3 ? 0.93 : 0} live={live} />
          </div>
        </Stage>

        <AlertCard show={step >= 3} label="ALERTA #1 · modelo" delay={live ? 1.0 : 0} />
      </div>

      {/* ── Right · phone + sliding window ── */}
      <Phone notify={step >= 4} live={live} />
      <WindowChart active={step >= 5} live={live} />
      <div className="absolute left-[1534px] top-[836px] w-[266px]">
        <AlertCard show={step >= 5} label="ALERTA #2 · ventana 2 min" delay={live ? CROSS_DELAY : 0} compact />
      </div>

      <div className="absolute bottom-[36px] right-[250px] text-caption italic text-muted">Simulación</div>
    </>
  );
}
