"use client";

import { Fragment, useEffect, useRef } from "react";
import { noteSegments } from "@/content/slides";
import { cx } from "@/components/ui/primitives";

/** "(Tecla 1)" cues rendered as key hints, text kept verbatim. */
function withKeyHints(text: string) {
  const parts = text.split(/(\(Tecla \d\))/g);
  return parts.map((part, i) =>
    /^\(Tecla \d\)$/.test(part) ? (
      <kbd
        key={i}
        className="mx-[2px] rounded-[8px] border-2 border-info/60 bg-info/10 px-[8px] py-[1px] font-mono text-[0.8em] font-semibold text-info"
      >
        {part}
      </kbd>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Speaker notes; each [→] is an accent marker, the one for the current step is highlighted. */
export function SpeakerNotes({ notes, step }: { notes: string; step: number }) {
  const segments = noteSegments(notes);
  const currentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [step, notes]);

  return (
    <p className="text-[30px] leading-[1.5] text-fg">
      {segments.map((segment, k) => {
        const isCurrent = k === Math.min(step, segments.length - 1);
        return (
          <Fragment key={k}>
            {k > 0 && (
              <span
                className={cx(
                  "mx-[6px] inline-flex h-[1.25em] min-w-[1.9em] items-center justify-center rounded-[10px] px-[6px] align-[-0.18em] font-mono text-[0.72em] font-bold transition-colors",
                  k === step
                    ? "bg-accent text-bg shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_35%,transparent)]"
                    : k < step
                      ? "bg-accent/25 text-accent/80"
                      : "border-2 border-accent/70 text-accent",
                )}
                aria-label={`paso ${k}`}
              >
                →{k}
              </span>
            )}
            <span
              ref={isCurrent ? currentRef : undefined}
              className={cx(
                "transition-colors duration-300",
                k < step && !isCurrent ? "text-muted" : "text-fg",
                isCurrent && segment.length > 0 && "rounded-[6px] bg-accent/10",
              )}
            >
              {withKeyHints(segment)}
            </span>{" "}
          </Fragment>
        );
      })}
    </p>
  );
}
