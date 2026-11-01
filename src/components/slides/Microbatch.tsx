"use client";

import { Database } from "lucide-react";
import { Card, Content, Pill, SlideTitle } from "@/components/ui/primitives";

/** M1 static version: final state of micro-batch 2 in update mode. */
export function Microbatch() {
  return (
    <>
      <SlideTitle>Ejemplo: pagos cada 5 minutos</SlideTitle>
      <Content>
        <div className="flex items-start justify-between">
          <Card className="w-[400px] p-[28px]">
            <div className="text-caption uppercase tracking-[0.1em] text-muted">Input table</div>
            <div className="mt-[12px] font-mono text-[24px] text-muted">event_time</div>
            {["12:01", "12:02", "12:06", "12:07"].map((t) => (
              <div key={t} className="mt-[10px] font-mono text-data text-fg">
                {t}
              </div>
            ))}
          </Card>
          <div className="mt-[120px] rounded-[16px] border-2 border-accent bg-accent/10 px-[24px] py-[16px] font-mono text-data text-fg">
            groupBy(window(event_time, &quot;5 min&quot;)).count()
          </div>
          <Card className="w-[440px] p-[28px]">
            <div className="text-caption uppercase tracking-[0.1em] text-muted">Result table</div>
            <div className="mt-[12px] grid grid-cols-[1fr_100px] font-mono text-[24px] text-muted">
              <span>ventana</span>
              <span>count</span>
            </div>
            {[
              ["12:00–12:05", "2"],
              ["12:05–12:10", "2"],
            ].map(([w, c]) => (
              <div key={w} className="mt-[10px] grid grid-cols-[1fr_100px] font-mono text-data text-fg">
                <span>{w}</span>
                <span>{c}</span>
              </div>
            ))}
          </Card>
        </div>
        <Card className="absolute bottom-0 left-0 right-0 flex items-center gap-[32px] p-[32px]">
          <Database size={44} className="text-info" aria-hidden />
          <span className="text-body font-semibold">Sink</span>
          <Pill tone="accent">update</Pill>
          <span className="font-mono text-data">12:05–12:10 → 2</span>
          <span className="ml-auto">
            <Pill tone="info">Micro-batch 2 · 1 evento procesado</Pill>
          </span>
        </Card>
      </Content>
    </>
  );
}
