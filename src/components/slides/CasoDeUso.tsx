"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronRight, History, Radio, Save, Scale, ShieldCheck } from "lucide-react";
import { useAmbient, useSlideEnv } from "@/components/deck/SlideEnv";
import { Reveal } from "@/components/ui/Reveal";
import { Pill, SlideTitle, cx } from "@/components/ui/primitives";
import type { SlideProps } from "./types";

interface Box {
  label: ReactNode;
  x: number;
  w: number;
  accent?: boolean;
}

const TOP_Y = 272;
const BOTTOM_Y = 636;
const BOX_H = 170;

const BATCH: readonly Box[] = [
  { label: "Histórico (Parquet)", x: 120, w: 250 },
  { label: "ETL: limpieza + variables (hora, gasto medio 30 días)", x: 408, w: 500 },
  { label: "Entrenar Pipeline", x: 946, w: 290 },
  {
    label: (
      <span className="flex items-center gap-[12px]">
        <Save size={32} aria-hidden className="text-accent" /> PipelineModel
      </span>
    ),
    x: 1274,
    w: 270,
    accent: true,
  },
];

const STREAMING: readonly Box[] = [
  { label: "Kafka", x: 120, w: 170 },
  { label: "Structured Streaming", x: 328, w: 250 },
  { label: "Join con perfil del cliente", x: 616, w: 270 },
  { label: "Modelo · transform()", x: 924, w: 250, accent: true },
  { label: "Ventana 2 min + watermark 10 min", x: 1212, w: 300 },
  { label: "Alertas · base de datos", x: 1550, w: 250 },
];

function Lane({ boxes, y }: { boxes: readonly Box[]; y: number }) {
  return (
    <>
      {boxes.map((b, i) => (
        <div key={i}>
          <div
            className={cx(
              "absolute flex items-center justify-center rounded-[18px] border-2 bg-surface px-[18px] text-center text-[30px] font-medium leading-[1.25] text-fg",
              b.accent ? "border-accent" : "border-edge",
            )}
            style={{ left: b.x, top: y, width: b.w, height: BOX_H }}
          >
            {b.label}
          </div>
          {i < boxes.length - 1 && (
            <ChevronRight
              size={34}
              strokeWidth={3}
              className="absolute text-muted"
              style={{ left: b.x + b.w + 2, top: y + BOX_H / 2 - 17 }}
              aria-hidden
            />
          )}
        </div>
      ))}
    </>
  );
}

const DOTS = 9;

export function CasoDeUso({ step }: SlideProps) {
  const ambient = useAmbient();
  const { animate } = useSlideEnv();
  const showLink = step >= 3;
  const markerId = `arrow-load-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // PipelineModel (bottom-centre) → Modelo · transform() (top-centre)
  const from = { x: 1274 + 135, y: TOP_Y + BOX_H };
  const to = { x: 924 + 125, y: BOTTOM_Y - 6 };
  const path = `M ${from.x} ${from.y + 6} C ${from.x} ${from.y + 110}, ${to.x} ${to.y - 120}, ${to.x} ${to.y - 14}`;

  return (
    <>
      <SlideTitle>Caso de uso: detección de fraude bancario</SlideTitle>
      <div className={cx("absolute inset-0", !ambient && "ambient-off")}>
        <Reveal show={step >= 1} className="absolute inset-0">
          <div className="absolute left-[120px] top-[222px] flex items-center gap-[14px] text-[28px] font-semibold uppercase tracking-[0.12em] text-info">
            <History size={30} aria-hidden /> Batch · el pasado
          </div>
          <Lane boxes={BATCH} y={TOP_Y} />
          <div className="absolute left-[408px] top-[462px]">
            <Pill tone="muted" className="py-[6px] text-[26px] text-fg">
              <Scale size={28} className="text-accent" aria-hidden />
              Fraude ≈ 0,1 % → pesos por clase, no accuracy
            </Pill>
          </div>
        </Reveal>

        <Reveal show={step >= 2} className="absolute inset-0">
          <div className="absolute left-[120px] top-[586px] flex items-center gap-[14px] text-[28px] font-semibold uppercase tracking-[0.12em] text-accent">
            <Radio size={30} aria-hidden /> Streaming · el presente
          </div>
          <Lane boxes={STREAMING} y={BOTTOM_Y} />
          {/* ambient: events flowing along the streaming lane */}
          <div className="absolute left-[120px] top-[836px] h-[16px] w-[1680px] overflow-hidden" aria-hidden>
            <div className="absolute inset-x-0 top-[7px] h-[2px] bg-edge" />
            {Array.from({ length: DOTS }, (_, i) => (
              <span
                key={i}
                className="flow-dot absolute top-0 block h-[16px] w-[16px] rounded-full bg-accent"
                style={
                  {
                    "--flow-from": "-20px",
                    "--flow-to": "1700px",
                    "--flow-duration": "7s",
                    "--flow-delay": `${-(i * 7) / DOTS}s`,
                    left: ambient ? 0 : (i * 1680) / DOTS + 40,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </Reveal>

        {/* step 3: the trained model is loaded by the streaming job */}
        <svg className="pointer-events-none absolute inset-0 text-accent" width={1920} height={1080} aria-hidden>
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>
          {animate ? (
            <motion.path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth={5}
              strokeDasharray="1 0"
              markerEnd={showLink ? `url(#${markerId})` : undefined}
              initial={false}
              animate={{ pathLength: showLink ? 1 : 0, opacity: showLink ? 1 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          ) : (
            <path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth={5}
              markerEnd={`url(#${markerId})`}
              opacity={showLink ? 1 : 0}
            />
          )}
        </svg>
        <Reveal show={showLink} from="fade" delay={0.25} className="absolute left-[1440px] top-[492px]">
          <span className="rounded-full bg-accent px-[18px] py-[6px] text-[26px] font-semibold text-bg">
            se carga en streaming
          </span>
        </Reveal>
        <Reveal show={showLink} delay={0.35} className="absolute right-[120px] top-[880px]">
          <Pill tone="ok" className="py-[10px] text-[28px]">
            <ShieldCheck size={32} aria-hidden />
            checkpoint · sin perder ni duplicar alertas
          </Pill>
        </Reveal>
      </div>
    </>
  );
}
