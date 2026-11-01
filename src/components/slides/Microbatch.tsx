"use client";

import { AnimatePresence, motion } from "motion/react";
import { Database, Hourglass, Layers, TriangleAlert } from "lucide-react";
import { useSlideEnv } from "@/components/deck/SlideEnv";
import { CountUp, formatInt } from "@/components/ui/CountUp";
import { EASE_OUT, Reveal } from "@/components/ui/Reveal";
import { Segmented } from "@/components/ui/Segmented";
import { ArrowRightLine, SlideTitle, cx } from "@/components/ui/primitives";
import { ALL_INPUT, formatResultRow, simulateMicrobatch, windowLabel } from "@/lib/sim/microbatch";
import { OUTPUT_MODES, type OutputMode } from "@/lib/sim/types";
import type { SlideProps } from "./types";

const MODE_OPTIONS = OUTPUT_MODES.map((m) => ({ value: m, label: m, hint: `Tecla ${m[0].toUpperCase()}` }));

/** Both result windows, in display order (fixed slots → no layout jumps). */
const RESULT_SLOTS = [720, 725].map((start) => windowLabel(start));

const ROW_H = 66;

export function Microbatch({ step, outputMode, onOutputMode }: SlideProps) {
  const { animate: live } = useSlideEnv();
  const sim = simulateMicrobatch(step, outputMode);

  return (
    <>
      <SlideTitle>Ejemplo: pagos cada 5 minutos</SlideTitle>

      {/* ── Input table ── */}
      <div className="absolute left-[120px] top-[216px] w-[360px]">
        <div className="text-[26px] font-semibold uppercase tracking-[0.12em] text-muted">Input table</div>
        <div className="mt-[12px] overflow-hidden rounded-[18px] border-2 border-edge bg-surface">
          <div className="flex h-[58px] items-center border-b-2 border-edge px-[24px] font-mono text-[26px] text-muted">
            event_time
          </div>
          <div className="relative" style={{ height: ALL_INPUT.length * ROW_H }}>
            {ALL_INPUT.map((row, i) => {
              const shown = sim.batch >= row.batch;
              const isCurrent = shown && row.batch === sim.batch;
              const isOld = shown && row.batch < sim.batch;
              return (
                <Reveal
                  key={row.clock}
                  show={shown}
                  from="left"
                  delay={live && row.batch === 1 ? i * 0.15 : 0}
                  className="absolute inset-x-0"
                  style={{ top: i * ROW_H, height: ROW_H }}
                >
                  <div
                    className={cx(
                      "flex h-full items-center gap-[16px] border-b border-edge/60 px-[24px] font-mono text-data transition-[opacity,background-color] duration-500",
                      isCurrent && "bg-accent/12 text-fg",
                      isOld && "text-fg opacity-40",
                    )}
                  >
                    <span className="tabular-nums">{row.clock}</span>
                    {isCurrent && sim.batch === 2 && (
                      <span className="rounded-full bg-accent px-[14px] py-[2px] font-sans text-[22px] font-semibold text-bg">
                        procesado
                      </span>
                    )}
                  </div>
                </Reveal>
              );
            })}
            {/* bracket over the rows of earlier micro-batches */}
            <Reveal
              show={sim.batch === 2}
              from="fade"
              className="absolute right-[18px] flex items-center"
              style={{ top: 10, height: 3 * ROW_H - 20 }}
            >
              <span className="mr-[10px] font-sans text-[22px] font-medium text-muted">ya procesados</span>
              <span className="h-full w-[12px] rounded-r-[8px] border-y-2 border-r-2 border-muted/70" />
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── Query ── */}
      <div className="absolute left-[504px] top-[330px] flex items-center gap-[10px]">
        <ArrowRightLine width={48} className={sim.batch > 0 ? "text-accent" : "text-muted"} />
        <div className="w-[680px] rounded-[18px] border-2 border-accent bg-accent/10 px-[26px] py-[18px] font-mono text-data leading-[1.45] text-fg">
          <div className="text-caption font-sans font-semibold uppercase tracking-[0.12em] text-accent">consulta</div>
          <div className="mt-[4px] whitespace-nowrap">groupBy(window(event_time, &quot;5 min&quot;))</div>
          <div>.count()</div>
        </div>
        <ArrowRightLine width={48} className={sim.batch > 0 ? "text-accent" : "text-muted"} />
      </div>

      {/* micro-batch badge / waiting caption */}
      <div className="absolute left-[562px] top-[540px] h-[64px] w-[680px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={sim.batch}
            className="flex h-full items-center"
            initial={live ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={live ? { opacity: 0, y: -12 } : undefined}
            transition={{ duration: live ? 0.25 : 0 }}
          >
            {sim.batch === 0 ? (
              <span className="flex items-center gap-[14px] text-[32px] italic text-muted">
                <Hourglass size={34} aria-hidden /> Esperando datos…
              </span>
            ) : (
              <span className="flex items-center gap-[14px] rounded-full border-2 border-info bg-info/12 px-[24px] py-[8px] text-[30px] font-semibold text-info">
                <Layers size={32} aria-hidden />
                Micro-batch {sim.batch} · {sim.processed} {sim.processed === 1 ? "evento procesado" : "eventos procesados"}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Result table ── */}
      <div className="absolute left-[1300px] top-[216px] w-[500px]">
        <div className="text-[26px] font-semibold uppercase tracking-[0.12em] text-muted">Result table</div>
        <div className="mt-[12px] overflow-hidden rounded-[18px] border-2 border-edge bg-surface">
          <div className="grid h-[58px] grid-cols-[1fr_130px] items-center border-b-2 border-edge px-[24px] font-mono text-[26px] text-muted">
            <span>ventana</span>
            <span className="text-right">count</span>
          </div>
          {RESULT_SLOTS.map((label) => {
            const row = sim.result.find((r) => r.label === label);
            const changed = sim.changed.includes(label);
            return (
              <Reveal key={label} show={Boolean(row)} from="right" delay={live ? 0.35 : 0} style={{ height: ROW_H }}>
                <div
                  className={cx(
                    "grid h-full grid-cols-[1fr_130px] items-center border-b border-edge/60 px-[24px] font-mono text-data transition-colors duration-500",
                    changed ? "bg-accent/12 text-fg" : "text-fg/80",
                  )}
                >
                  <span className="tabular-nums">{label}</span>
                  <CountUp
                    value={row?.count ?? 0}
                    format={formatInt}
                    duration={0.6}
                    delay={0.45}
                    className={cx("text-right text-[40px] font-semibold tabular-nums", changed && "text-accent")}
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* ── Sink ── */}
      <div className="absolute left-[120px] right-[120px] top-[690px] flex h-[240px] items-stretch gap-[40px] rounded-[22px] border-2 border-edge bg-surface px-[36px] py-[28px]">
        <div className="flex w-[480px] shrink-0 flex-col justify-between">
          <div className="flex items-center gap-[16px] text-[40px] font-semibold text-fg">
            <Database size={44} className="text-info" aria-hidden /> Sink
            <span className="ml-[6px] font-mono text-[22px] font-normal text-muted">A · U · C</span>
          </div>
          <Segmented<OutputMode>
            ariaLabel="Output mode"
            options={MODE_OPTIONS}
            value={outputMode}
            onChange={onOutputMode}
            size="lg"
            className="self-start"
          />
        </div>
        <div className="w-[2px] shrink-0 bg-edge" />
        <div className="relative flex-1">
          <div className="text-caption font-medium text-muted">
            {sim.batch === 0 ? "sin micro-batches todavía" : `escrito en el micro-batch ${sim.batch}`}
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            {sim.sink.kind === "warning" ? (
              <motion.div
                key="warning"
                className="mt-[16px] flex items-center gap-[20px] rounded-[18px] border-[3px] border-bad bg-bad/12 px-[28px] py-[22px] text-[34px] font-semibold text-fg"
                initial={live ? { opacity: 0, scale: 0.96 } : false}
                animate={{ opacity: 1, scale: 1 }}
                exit={live ? { opacity: 0 } : undefined}
                transition={{ duration: live ? 0.3 : 0, ease: EASE_OUT }}
              >
                <TriangleAlert size={44} className="shrink-0 text-bad" aria-hidden />
                <span className="font-mono">{sim.sink.message}</span>
              </motion.div>
            ) : (
              <motion.div
                key={`rows-${outputMode}-${sim.batch}`}
                className="mt-[16px] flex flex-wrap gap-[18px]"
                initial={live ? { opacity: 0, x: 24 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={live ? { opacity: 0 } : undefined}
                transition={{ duration: live ? 0.35 : 0, delay: live ? 0.5 : 0, ease: EASE_OUT }}
              >
                {sim.sink.rows.length === 0 ? (
                  <span className="font-mono text-[34px] text-muted">—</span>
                ) : (
                  sim.sink.rows.map((r) => (
                    <span
                      key={r.label}
                      className="rounded-[16px] border-2 border-ok bg-ok/12 px-[24px] py-[12px] font-mono text-[34px] font-semibold text-fg"
                    >
                      {formatResultRow(r)}
                    </span>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
