"use client";

import { Cog, Database, Radio, ShieldCheck, Zap, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightLine, Card, Content, Pill, SlideTitle } from "@/components/ui/primitives";
import type { SlideProps } from "./types";

const FLOW: ReadonlyArray<{ head: string; tail: string; icon: LucideIcon }> = [
  { head: "Fuente", tail: "Kafka", icon: Radio },
  { head: "Consulta", tail: "transformación", icon: Cog },
  { head: "Destino", tail: "sink", icon: Database },
];

const MODES: ReadonlyArray<{ mode: string; text: string }> = [
  { mode: "append", text: "solo filas nuevas" },
  { mode: "update", text: "solo filas que cambian" },
  { mode: "complete", text: "toda la tabla" },
];

export function ConsultaStreaming({ step }: SlideProps) {
  return (
    <>
      <SlideTitle>Una consulta de streaming</SlideTitle>
      <Content>
        <Reveal show={step >= 1} className="flex h-[180px] items-center justify-between">
          {FLOW.map((box, i) => {
            const Icon = box.icon;
            return (
              <div key={box.head} className="flex items-center">
                <Card className="flex h-[160px] w-[470px] items-center gap-[28px] px-[40px]">
                  <Icon size={56} strokeWidth={1.75} className="shrink-0 text-info" aria-hidden />
                  <div className="text-[38px] font-semibold text-fg">
                    {box.head}
                    <span className="text-muted"> · </span>
                    <span className="font-medium text-muted">{box.tail}</span>
                  </div>
                </Card>
                {i < FLOW.length - 1 && <ArrowRightLine width={90} className="mx-[20px] text-accent" />}
              </div>
            );
          })}
        </Reveal>

        <Reveal show={step >= 2} className="mt-[56px] grid grid-cols-3 gap-[40px]">
          {MODES.map((m) => (
            <Card key={m.mode} className="px-[40px] py-[36px]">
              <div className="font-mono text-[44px] font-semibold text-accent">{m.mode}</div>
              <div className="mt-[10px] text-body text-fg">{m.text}</div>
            </Card>
          ))}
        </Reveal>

        <Reveal show={step >= 3} className="mt-[64px] flex flex-wrap items-center gap-[32px]">
          <Pill tone="ok" className="py-[16px] text-[32px]">
            <ShieldCheck size={36} aria-hidden />
            Checkpoint → exactly-once
          </Pill>
          <Pill tone="info" className="py-[16px] text-[32px]">
            <Zap size={36} aria-hidden />
            Spark 4.1 · Real-Time Mode: milisegundos (consultas sin estado)
          </Pill>
        </Reveal>
      </Content>
    </>
  );
}
