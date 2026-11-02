# Spark en tiempo real · Grupo 6

Web slide deck (Next.js 16 · React 19 · Tailwind v4) for the Big Data Aplicado presentation:
Structured Streaming, watermarking and MLlib, ending with a fraud-detection use case.

```bash
npm install
npm run dev                      # http://localhost:3000
npm run build && npm run start   # production
npm test                         # simulation logic tests (vitest)
```

- `/`: the deck (projector). `→`/`←`, `PageDown`/`PageUp`, `F` fullscreen, `T` theme, `P` presenter.
- `/presenter`: speaker view (notes, next step, timers), synced with `/`.
- `/print`: all slides at their final step, one 1920×1080 page each (PDF backup).

Content and verbatim speaker notes live in `src/content/slides.ts`; the simulations in `src/lib/sim/`.
See **REPORT.md** for decisions, the full shortcut list and how to present with two screens.
