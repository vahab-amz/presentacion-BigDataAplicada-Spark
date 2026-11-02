import { STEPS_OF, TOTAL_SLIDES, type SlideDef } from "@/content/slides";
import { progressOf } from "@/lib/deck/navigation";

/**
 * Progress bar (top) and slide number (bottom-right).
 * The speaker's name is deliberately not shown on the projector (only in /presenter).
 */
export function SlideChrome({ def, step }: { def: SlideDef; step: number }) {
  const progress = progressOf({ slide: def.id, step }, STEPS_OF);
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[8px] bg-edge/60">
        <div
          className="h-full bg-accent transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="pointer-events-none absolute bottom-[36px] right-[120px] font-mono text-[24px] text-muted tabular-nums">
        {def.id} / {TOTAL_SLIDES}
      </div>
    </>
  );
}
