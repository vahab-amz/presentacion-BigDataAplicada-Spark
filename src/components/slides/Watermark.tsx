"use client";

import { Lock } from "lucide-react";
import { Card, Content, SlideTitle, cx } from "@/components/ui/primitives";

/** M1 static version: final state with a 10-minute threshold. */
const WINDOWS = [
  { label: "[12:00, 12:10)", count: 2, closed: true },
  { label: "[12:10, 12:20)", count: 1, closed: false },
  { label: "[12:20, 12:30)", count: 1, closed: false },
];
const EVENTS = [
  { t: "12:04", ok: true },
  { t: "12:14", ok: true },
  { t: "12:07", ok: true },
  { t: "12:25", ok: true },
  { t: "12:03", ok: false },
];

export function Watermark() {
  return (
    <>
      <SlideTitle>Watermark en acción</SlideTitle>
      <Content>
        <div className="grid grid-cols-3 gap-[24px] pr-[460px]">
          {WINDOWS.map((w) => (
            <Card
              key={w.label}
              tone={w.closed ? "muted" : "accent"}
              className={cx("h-[300px] p-[24px]", w.closed && "opacity-70")}
            >
              <div className="font-mono text-data">{w.label}</div>
              <div className="mt-[16px] font-mono text-[64px] font-semibold">{w.count}</div>
              <div
                className={cx(
                  "mt-[12px] flex items-center gap-[10px] text-caption",
                  w.closed ? "text-muted" : "text-accent",
                )}
              >
                {w.closed && <Lock size={24} aria-hidden />} {w.closed ? "cerrada" : "abierta · en memoria"}
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-[60px] flex gap-[20px]">
          {EVENTS.map((e) => (
            <div
              key={e.t}
              className={cx(
                "rounded-[14px] border-2 px-[20px] py-[10px] font-mono text-data",
                e.ok ? "border-ok text-ok" : "border-bad text-bad",
              )}
            >
              {e.t} · {e.ok ? "aceptado" : "descartado"}
            </div>
          ))}
        </div>
        <Card className="absolute right-0 top-0 w-[420px] p-[28px] font-mono text-data">
          <div>máx. event time = 12:25</div>
          <div>umbral = 10 min</div>
          <div className="text-accent">watermark = 12:15</div>
          <div className="mt-[16px] font-sans text-caption text-muted">Memoria: 2 ventanas abiertas</div>
        </Card>
      </Content>
    </>
  );
}
