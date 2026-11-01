"use client";

import { Brain, Infinity as InfinityIcon, ShieldAlert, Timer, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Card, Content, SlideTitle, cx } from "@/components/ui/primitives";
import type { SlideProps } from "./types";

const CARDS: ReadonlyArray<{ title: string; sub: string; icon: LucideIcon; accent?: boolean }> = [
  { title: "1 · Structured Streaming", sub: "La tabla infinita", icon: InfinityIcon },
  { title: "2 · Watermarking", sub: "Datos con retraso", icon: Timer },
  { title: "3 · MLlib", sub: "Transformers, Estimators, Pipelines", icon: Brain },
  { title: "Caso de uso", sub: "Detección de fraude bancario", icon: ShieldAlert, accent: true },
];

export function NuestroTema({ step }: SlideProps) {
  return (
    <>
      <SlideTitle>Nuestro tema</SlideTitle>
      <Content className="grid grid-cols-2 grid-rows-2 gap-[40px] pt-[16px]">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <Reveal key={card.title} show={step >= i + 1} className="h-full">
              <Card
                tone={card.accent ? "accent" : "default"}
                className={cx("flex h-full items-center gap-[40px] px-[56px]", card.accent && "bg-accent/8")}
              >
                <div
                  className={cx(
                    "flex h-[112px] w-[112px] shrink-0 items-center justify-center rounded-[28px]",
                    card.accent ? "bg-accent/15 text-accent" : "bg-bg text-info",
                  )}
                >
                  <Icon size={60} strokeWidth={1.75} aria-hidden />
                </div>
                <div>
                  <div className="text-h3 font-semibold text-fg">{card.title}</div>
                  <div className={cx("mt-[12px] text-body", card.accent ? "text-accent" : "text-muted")}>
                    {card.sub}
                  </div>
                </div>
              </Card>
            </Reveal>
          );
        })}
      </Content>
    </>
  );
}
