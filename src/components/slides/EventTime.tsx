"use client";

import { Clock, CreditCard, MemoryStick, Scale, WifiOff } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightLine, Card, Content, Pill, SlideTitle } from "@/components/ui/primitives";
import type { SlideProps } from "./types";

function ClockBlock({ label, time, sub, tone }: { label: string; time: string; sub: string; tone: "info" | "accent" }) {
  const color = tone === "info" ? "text-info" : "text-accent";
  return (
    <div className="flex shrink-0 items-center gap-[24px]">
      <Clock size={88} strokeWidth={1.5} className={color} aria-hidden />
      <div>
        <div className="whitespace-nowrap text-[38px] font-semibold text-fg">
          {label} · <span className={`font-mono tabular-nums ${color}`}>{time}</span>
        </div>
        <div className="mt-[4px] text-body text-muted">{sub}</div>
      </div>
    </div>
  );
}

export function EventTime({ step }: SlideProps) {
  return (
    <>
      <SlideTitle>Event time vs processing time</SlideTitle>
      <Content>
        <Reveal show={step >= 1}>
          <Card className="relative flex h-[270px] items-center gap-[36px] px-[56px]">
            <div className="absolute -top-[22px] left-[48px] flex items-center gap-[12px] rounded-full border-2 border-edge bg-surface px-[18px] py-[2px] text-caption font-semibold uppercase tracking-[0.1em] text-muted">
              <CreditCard size={26} aria-hidden /> pago
            </div>
            <ClockBlock label="Event time" time="12:04" sub="cuándo ocurrió" tone="info" />
            {/* dashed delay arrow */}
            <div className="relative flex flex-1 flex-col items-center">
              <div className="mb-[14px] flex items-center gap-[12px] text-[30px] font-medium text-bad">
                <WifiOff size={36} aria-hidden /> sin cobertura
              </div>
              <ArrowRightLine width={330} dashed className="text-bad" />
              <div className="mt-[10px] font-mono text-caption text-muted">+5 min</div>
            </div>
            <ClockBlock label="Processing time" time="12:09" sub="cuándo llegó" tone="accent" />
          </Card>
        </Reveal>

        <Reveal show={step >= 2} className="mt-[56px] flex items-center gap-[24px] text-[40px] font-medium text-fg">
          <MemoryStick size={52} strokeWidth={1.75} className="shrink-0 text-bad" aria-hidden />
          <span>Ventanas abiertas = estado en memoria → crece sin fin</span>
        </Reveal>

        <Reveal show={step >= 3} from="scale" className="mt-[48px]">
          <div className="inline-block rounded-[20px] border-2 border-accent bg-accent/10 px-[48px] py-[24px] font-mono text-[60px] font-semibold text-fg">
            watermark = <span className="text-accent">máx(event time)</span> − umbral
          </div>
        </Reveal>

        <Reveal show={step >= 4} className="mt-[52px] flex items-center gap-[32px]">
          <Scale size={48} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
          <Pill tone="info" className="py-[14px] text-[32px]">Umbral grande: + precisión · + memoria</Pill>
          <Pill tone="accent" className="py-[14px] text-[32px]">Umbral pequeño: − memoria · − precisión</Pill>
        </Reveal>
      </Content>
    </>
  );
}
