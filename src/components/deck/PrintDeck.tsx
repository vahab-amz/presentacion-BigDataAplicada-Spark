"use client";

import { Moon, Printer, Sun } from "lucide-react";
import { slides } from "@/content/slides";
import { THEME_STORAGE_KEY } from "@/lib/deck/types";
import { DEFAULT_OUTPUT_MODE, DEFAULT_THRESHOLD } from "@/lib/sim/types";
import { StaticSlide } from "./SlideCanvas";
import { SlideEnvProvider } from "./SlideEnv";

const PRINT_ENV = { animate: false, ambient: false } as const;

function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
}

/** `/print`: all 12 slides at their final step, one 1920×1080 page each (PDF backup). */
export function PrintDeck() {
  return (
    <SlideEnvProvider value={PRINT_ENV}>
      <div className="print-root min-h-dvh bg-bg py-[24px] text-fg">
        <div className="print-toolbar mx-auto mb-[24px] flex max-w-[960px] flex-wrap items-center gap-[12px] rounded-[14px] border-2 border-edge bg-surface px-[18px] py-[12px] text-[16px]">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex cursor-pointer items-center gap-[8px] rounded-[10px] bg-accent px-[14px] py-[8px] font-semibold text-bg"
          >
            <Printer size={18} aria-hidden /> Imprimir / Guardar como PDF
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex cursor-pointer items-center gap-[8px] rounded-[10px] border-2 border-edge px-[12px] py-[6px] font-semibold"
          >
            <Sun size={18} aria-hidden />/<Moon size={18} aria-hidden /> Tema
          </button>
          <span className="text-muted">
            Destino «Guardar como PDF» · Márgenes «Ninguno» · activar «Gráficos de fondo».
          </span>
        </div>
        {slides.map((def) => (
          <section key={def.id} className="print-page bg-bg" aria-label={`Diapositiva ${def.id}: ${def.title}`}>
            <StaticSlide
              def={def}
              step={def.steps}
              threshold={DEFAULT_THRESHOLD}
              outputMode={DEFAULT_OUTPUT_MODE}
            />
          </section>
        ))}
      </div>
    </SlideEnvProvider>
  );
}
