"use client";

import { MotionConfig } from "motion/react";
import { useDeck } from "@/lib/deck/useDeck";
import { LiveSlides } from "./LiveSlides";
import { useIsClient } from "./SlideEnv";
import { Stage } from "./Stage";

function Deck() {
  const deck = useDeck("audience");
  return (
    <main className="h-dvh w-screen bg-bg">
      <h1 className="sr-only">Spark en tiempo real · Grupo 6</h1>
      <Stage onNavigate={(dir) => (dir > 0 ? deck.next() : deck.prev())}>
        <LiveSlides deck={deck} />
      </Stage>
    </main>
  );
}

/** Projector view: `/`. Client-rendered (state lives in the URL hash). */
export function AudienceDeck() {
  const isClient = useIsClient();
  return (
    <MotionConfig reducedMotion="user">
      {isClient ? <Deck /> : <div className="h-dvh w-screen bg-bg" />}
    </MotionConfig>
  );
}
