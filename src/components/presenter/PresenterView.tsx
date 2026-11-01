"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Moon,
  MonitorUp,
  Pause,
  Play,
  RotateCcw,
  Sun,
} from "lucide-react";
import { LiveSlides } from "@/components/deck/LiveSlides";
import { StaticSlide } from "@/components/deck/SlideCanvas";
import { SlideEnvProvider, useIsClient } from "@/components/deck/SlideEnv";
import { Stage } from "@/components/deck/Stage";
import { Segmented } from "@/components/ui/Segmented";
import { cx } from "@/components/ui/primitives";
import { STEPS_OF, TOTAL_SLIDES, slideAt } from "@/content/slides";
import { isLastPosition, nextPosition } from "@/lib/deck/navigation";
import type { Speaker } from "@/lib/deck/types";
import { MICROBATCH_SLIDE, WATERMARK_SLIDE, useDeck, type DeckController } from "@/lib/deck/useDeck";
import { OUTPUT_MODES, THRESHOLDS, type OutputMode, type Threshold } from "@/lib/sim/types";
import { SpeakerNotes } from "./SpeakerNotes";
import { formatDuration, usePresenterTimer } from "./usePresenterTimer";

const SPEAKER_PILL: Record<Speaker, string> = {
  Vau: "bg-accent text-bg",
  Onai: "bg-info text-bg",
};

const STATIC_ENV = { animate: false, ambient: false } as const;

const THRESHOLD_OPTIONS = THRESHOLDS.map((t, i) => ({ value: t, label: `${t} min`, hint: `Tecla ${i + 1}` }));
const MODE_OPTIONS = OUTPUT_MODES.map((m) => ({ value: m, label: m, hint: `Tecla ${m[0].toUpperCase()}` }));

function IconButton({
  onClick,
  label,
  children,
  wide = false,
  tone = "default",
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  wide?: boolean;
  tone?: "default" | "accent";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      title={label}
      aria-label={label}
      className={cx(
        "inline-flex h-[44px] cursor-pointer items-center justify-center gap-[8px] rounded-[12px] border-2 text-[17px] font-semibold transition-colors",
        wide ? "px-[14px]" : "w-[44px]",
        tone === "accent"
          ? "border-accent bg-accent text-bg hover:brightness-110"
          : "border-edge bg-surface text-fg hover:border-muted",
      )}
    >
      {children}
    </button>
  );
}

function Panel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cx("flex min-h-0 flex-col", className)}>
      <h2 className="mb-[8px] text-[14px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</h2>
      {children}
    </section>
  );
}

function TopBar({ deck }: { deck: DeckController }) {
  const { state } = deck;
  const def = slideAt(state.slide);
  const timer = usePresenterTimer(def.speaker);

  return (
    <header className="flex flex-wrap items-center gap-x-[18px] gap-y-[10px] border-b-2 border-edge bg-surface px-[20px] py-[12px]">
      <span className={cx("rounded-full px-[16px] py-[4px] text-[20px] font-bold", SPEAKER_PILL[def.speaker])}>
        {def.speaker}
      </span>
      <div className="font-mono text-[20px] text-fg tabular-nums">
        Diapositiva <b>{state.slide}</b> / {TOTAL_SLIDES}
      </div>
      <div className="font-mono text-[20px] text-muted tabular-nums">
        Paso <b className="text-fg">{state.step}</b> / {def.steps}
      </div>

      <div className="flex items-center gap-[8px] rounded-[14px] border-2 border-edge bg-bg px-[10px] py-[4px]">
        <span className="font-mono text-[26px] font-semibold text-fg tabular-nums" aria-label="Tiempo total">
          {formatDuration(timer.elapsedMs)}
        </span>
        {timer.running ? (
          <IconButton onClick={timer.pause} label="Pausar cronómetro">
            <Pause size={20} />
          </IconButton>
        ) : (
          <IconButton onClick={timer.start} label="Iniciar cronómetro" tone="accent">
            <Play size={20} />
          </IconButton>
        )}
        <IconButton onClick={timer.reset} label="Reiniciar cronómetro">
          <RotateCcw size={20} />
        </IconButton>
      </div>
      <div className="flex items-center gap-[12px] font-mono text-[18px] tabular-nums">
        {(["Vau", "Onai"] as const).map((s) => (
          <span key={s} className={cx(s === def.speaker ? "text-fg" : "text-muted")}>
            <span className={cx("mr-[6px] inline-block h-[10px] w-[10px] rounded-full", s === "Vau" ? "bg-accent" : "bg-info")} />
            {s} {formatDuration(timer.perSpeakerMs[s])}
          </span>
        ))}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-[8px]">
        {state.slide === WATERMARK_SLIDE && (
          <Segmented<Threshold>
            ariaLabel="Umbral del watermark"
            options={THRESHOLD_OPTIONS}
            value={state.threshold}
            onChange={deck.setThreshold}
            size="sm"
          />
        )}
        {state.slide === MICROBATCH_SLIDE && (
          <Segmented<OutputMode>
            ariaLabel="Output mode"
            options={MODE_OPTIONS}
            value={state.outputMode}
            onChange={deck.setOutputMode}
            size="sm"
          />
        )}
        <IconButton onClick={deck.prev} label="Anterior (←)">
          <ChevronLeft size={24} />
        </IconButton>
        <IconButton onClick={deck.next} label="Siguiente (→)" tone="accent" wide>
          Siguiente <ChevronRight size={22} />
        </IconButton>
        <IconButton onClick={deck.toggleTheme} label="Cambiar tema (T)">
          {state.theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>
        <IconButton onClick={deck.toggleFullscreen} label="Pantalla completa (F)">
          <Maximize size={20} />
        </IconButton>
        <IconButton onClick={deck.openCompanion} label="Abrir vista para el proyector (P)" wide>
          <MonitorUp size={20} /> Proyector
        </IconButton>
      </div>
    </header>
  );
}

function Presenter() {
  const deck = useDeck("presenter");
  const { state } = deck;
  const def = slideAt(state.slide);
  const atEnd = isLastPosition(state, STEPS_OF);
  const nextPos = nextPosition(state, STEPS_OF);
  const nextDef = slideAt(nextPos.slide);

  return (
    <main className="flex h-dvh w-screen flex-col overflow-hidden bg-bg text-fg">
      <h1 className="sr-only">Vista del presentador · Spark en tiempo real</h1>
      <TopBar deck={deck} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-[18px] p-[18px]">
        <Panel title={`Actual · ${def.title}`}>
          <div className="min-h-0 flex-1 overflow-hidden rounded-[14px] border-2 border-edge">
            <Stage onNavigate={(dir) => (dir > 0 ? deck.next() : deck.prev())}>
              <LiveSlides deck={deck} />
            </Stage>
          </div>
        </Panel>

        <div className="flex min-h-0 flex-col gap-[16px]">
          <Panel
            title={
              atEnd
                ? "Siguiente · fin de la presentación"
                : nextPos.slide === state.slide
                  ? `Siguiente · paso ${nextPos.step} / ${nextDef.steps}`
                  : `Siguiente · diapositiva ${nextPos.slide}`
            }
          >
            <div className="aspect-video w-full overflow-hidden rounded-[14px] border-2 border-edge opacity-90">
              {atEnd ? (
                <div className="flex h-full items-center justify-center text-[22px] text-muted">Fin · ¿Preguntas?</div>
              ) : (
                <SlideEnvProvider value={STATIC_ENV}>
                  <Stage>
                    <StaticSlide
                      def={nextDef}
                      step={nextPos.step}
                      threshold={state.threshold}
                      outputMode={state.outputMode}
                    />
                  </Stage>
                </SlideEnvProvider>
              )}
            </div>
          </Panel>

          <Panel title="Notas" className="min-h-0 flex-1">
            <div className="min-h-0 flex-1 overflow-y-auto rounded-[14px] border-2 border-edge bg-surface px-[22px] py-[16px]">
              <SpeakerNotes notes={def.notes} step={state.step} />
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}

/** `/presenter`: live slide, next-step preview, notes, timers. Synced with `/`. */
export function PresenterView() {
  const isClient = useIsClient();
  return (
    <MotionConfig reducedMotion="user">
      {isClient ? <Presenter /> : <div className="h-dvh w-screen bg-bg" />}
    </MotionConfig>
  );
}
