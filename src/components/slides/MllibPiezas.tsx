"use client";

import { ArrowRight, Boxes, GraduationCap, Shuffle, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Card, Content, SlideTitle } from "@/components/ui/primitives";
import type { SlideProps } from "./types";

interface Piece {
  name: string;
  method: string;
  lines: string[];
  example?: string;
  icon: LucideIcon;
  tone: "ok" | "info" | "accent";
}

const PIECES: readonly Piece[] = [
  {
    name: "Transformer",
    method: "transform()",
    lines: ["DataFrame → DataFrame · no aprende"],
    example: "VectorAssembler",
    icon: Shuffle,
    tone: "ok",
  },
  {
    name: "Estimator",
    method: "fit()",
    lines: ["Aprende → devuelve un Transformer"],
    example: "RandomForestClassifier",
    icon: GraduationCap,
    tone: "info",
  },
  {
    name: "Pipeline",
    method: "fit() → PipelineModel",
    lines: ["Cadena de etapas · es un Estimator"],
    icon: Boxes,
    tone: "accent",
  },
];

const TONE: Record<Piece["tone"], { text: string; bg: string }> = {
  ok: { text: "text-ok", bg: "bg-ok/12" },
  info: { text: "text-info", bg: "bg-info/12" },
  accent: { text: "text-accent", bg: "bg-accent/12" },
};

export function MllibPiezas({ step }: SlideProps) {
  return (
    <>
      <SlideTitle>MLlib: tres piezas</SlideTitle>
      <Content>
        <div className="grid h-[470px] grid-cols-3 gap-[40px]">
          {PIECES.map((p, i) => {
            const Icon = p.icon;
            const tone = TONE[p.tone];
            return (
              <Reveal key={p.name} show={step >= i + 1} className="h-full">
                <Card className="flex h-full flex-col px-[44px] py-[40px]">
                  <div className="flex items-center gap-[20px]">
                    <span className={`flex h-[76px] w-[76px] items-center justify-center rounded-[20px] ${tone.bg} ${tone.text}`}>
                      <Icon size={44} strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="text-[50px] font-semibold text-fg">{p.name}</span>
                  </div>
                  <div className={`mt-[28px] font-mono text-[34px] font-semibold ${tone.text}`}>{p.method}</div>
                  {p.lines.map((l) => (
                    <div key={l} className="mt-[16px] text-body text-fg">
                      {l}
                    </div>
                  ))}
                  {p.example && (
                    <div className="mt-auto">
                      <div className="text-caption uppercase tracking-[0.1em] text-muted">ejemplo</div>
                      <div className="mt-[6px] font-mono text-data text-fg">{p.example}</div>
                    </div>
                  )}
                </Card>
              </Reveal>
            );
          })}
        </div>

        <Reveal show={step >= 4} className="mt-[48px]">
          <div className="flex items-center justify-center gap-[28px] rounded-[20px] border-2 border-accent bg-accent/10 py-[30px] text-[46px] font-semibold text-fg">
            Entrenar en batch
            <ArrowRight size={52} className="text-accent" aria-hidden />
            aplicar en streaming
          </div>
          <div className="mt-[18px] text-center font-mono text-caption text-muted">API actual: pyspark.ml (DataFrames)</div>
        </Reveal>
      </Content>
    </>
  );
}
