"use client";

import { Brain, Infinity as InfinityIcon, Timer, type LucideIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useIsClient } from "@/components/deck/SlideEnv";
import { Reveal } from "@/components/ui/Reveal";
import { Content, SlideTitle } from "@/components/ui/primitives";
import type { SlideProps } from "./types";

const LINES: ReadonlyArray<{ text: string; icon: LucideIcon }> = [
  { text: "Structured Streaming: el tiempo real como tabla infinita", icon: InfinityIcon },
  { text: "Watermark: equilibrio entre precisión y memoria", icon: Timer },
  { text: "MLlib: entrenar en batch, aplicar en streaming", icon: Brain },
];

function DeckQr() {
  const isClient = useIsClient();
  const url = isClient ? window.location.origin : "";
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-[300px] w-[300px] items-center justify-center rounded-[24px] bg-white p-[22px]">
        {url ? (
          <QRCodeSVG value={url} size={256} level="M" bgColor="#FFFFFF" fgColor="#0B0F17" marginSize={0} />
        ) : null}
      </div>
      <div className="mt-[18px] text-caption font-medium text-muted">Explora la presentación</div>
    </div>
  );
}

export function Resumen({ step }: SlideProps) {
  return (
    <>
      <SlideTitle>En resumen</SlideTitle>
      <Content>
        <div className="flex flex-col gap-[34px] pr-[420px]">
          {LINES.map((line, i) => {
            const Icon = line.icon;
            return (
              <Reveal key={line.text} show={step >= i + 1} from="left">
                <div className="flex items-center gap-[28px] text-[40px] font-medium text-fg">
                  <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[18px] bg-accent/12 text-accent">
                    <Icon size={40} strokeWidth={1.75} aria-hidden />
                  </span>
                  {line.text}
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="absolute right-0 top-0">
          <DeckQr />
        </div>

        <div className="absolute bottom-[96px] left-0 text-[110px] font-semibold tracking-[-0.03em] text-accent">
          ¿Preguntas?
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-edge pt-[24px] text-body text-muted">
          Una única plataforma para analítica en tiempo real y predictiva
        </div>
      </Content>
    </>
  );
}
