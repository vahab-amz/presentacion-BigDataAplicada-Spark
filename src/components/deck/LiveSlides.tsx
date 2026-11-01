"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { slideAt } from "@/content/slides";
import type { DeckController } from "@/lib/deck/useDeck";
import { SlideCanvas } from "./SlideCanvas";

const variants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 56 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -56 }),
};

/** Current slide with a short fade + slide transition (≤ 300 ms). */
export function LiveSlides({ deck }: { deck: DeckController }) {
  const { state } = deck;
  const def = slideAt(state.slide);
  return (
    <AnimatePresence initial={false} custom={state.dir}>
      <motion.div
        key={def.id}
        className="absolute inset-0"
        custom={state.dir}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <SlideCanvas
          def={def}
          step={state.step}
          threshold={state.threshold}
          outputMode={state.outputMode}
          onThreshold={deck.setThreshold}
          onOutputMode={deck.setOutputMode}
        />
      </motion.div>
    </AnimatePresence>
  );
}
