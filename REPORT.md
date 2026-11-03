# REPORT — "Spark en tiempo real" (Grupo 6)

Web slide deck for the Big Data Aplicado presentation (Vau y Onai). Built unattended from `PROMPT.md`.
Nothing has been deployed: deploy to Vercel yourself (it is a standard Next.js project, no env vars).

## Milestones

| | Milestone | Status | Commit |
| --- | --- | --- | --- |
| M1 | Deck engine + 12 slides (static interactive slides) | ✅ done | `73b282a` |
| M2 | Watermark simulator, slide 7 (`watermark.ts` + tests + animated UI) | ✅ done | `86b1367` |
| M3 | "3:14 · el viaje de un pago", slide 11 | ✅ done | `e539839` |
| M4 | Presenter view `/presenter` | ✅ done | `a558b66` |
| M5 | Micro-batch stepper, slide 5 (`microbatch.ts` + tests + UI) | ✅ done | `c3a6e9a` |
| M6 | Pipeline conveyor, slide 9 | ✅ done | `e22192a` |
| M7 | Polish: `/print`, QR, ambient loops (1, 3, 10, 11), reduced motion, light theme, metadata, offline | ✅ done | `a9b4ece`, `312a2f3` |
| — | Follow-up: presenter names removed from everything the projector shows | ✅ done | `ff52aa7` |
| — | Follow-up: Spark 4.1 Real-Time Mode badge and note removed from slide 4 | ✅ done | `3117884` |

Verification (final run):

- `npm run lint` → 0 problems · `npx vitest run` → 30 tests passed · `npm run build` → OK (`/`, `/presenter`, `/print` all static).
- Headless Chrome (DevTools protocol, two real windows): 16/16 checks for keyboard, hash, BroadcastChannel sync in both directions, threshold/output-mode keys, theme sync, Home/End, Backspace/PageUp, **back from slide 8 lands on 7/5**, and a new window adopting the running position. **0 console errors** on `/`, `/presenter` and `/print`, in production *and* in `next dev` (no hydration warnings).
- Every slide at its final step checked for elements outside the 1920×1080 canvas: none (only the ambient dots on slide 1 travel past the edge, by design, clipped). Screenshots: `screenshots/slide-01.png … slide-12.png` (dark theme, 1920×1080, final step). Light theme was checked the same way.
- Reduced motion (emulated): ambient loops stop (slide 1 dots, slide 3 table, slide 11 feed) and slide 3 resumes appending once motion is allowed again.
- Offline (emulated): after one online visit, reloading `/` and opening `/presenter` and `/print` with the network cut all work.
- `/print` → PDF: 12 pages of 1920×1080 px (1440×810 pt), no blank trailing page.
- No presenter names on the projector: the rendered text, `aria-label`, `alt` and `title` attributes of all 12 slides on `/`, the whole of `/print` and the page's meta description contain neither "Vau" nor "Onai" (checked in headless Chrome after the change).
- No Real-Time Mode (after the slide 4 change): lint, vitest (30 passed) and build re-run and all pass. In headless Chrome at 1920×1080, the rendered text of all 12 slides on `/` (final step), `/presenter` on slides 3 and 4 (live slide, next-step preview, notes) and the whole of `/print` contains neither "Real-Time", "Spark 4.1", "milisegundos" nor "sin estado"; "Checkpoint → exactly-once" is still there; 0 console errors. `screenshots/slide-04.png` regenerated.

## How to run

```bash
npm install
npm run dev                      # http://localhost:3000 (development)
npm run build && npm run start   # production build, http://localhost:3000
npm test                         # vitest (simulation logic, navigation, content)
npm run lint
```

Routes: `/` (projector), `/presenter` (speaker view), `/print` (PDF backup).
Position lives in the URL hash: `#/<slide>/<step>` (slide 1-based, step 0-based), e.g. `/#/7/5`. Reload keeps the position.

## Keyboard shortcuts (same on `/` and `/presenter`)

| Key | Action |
| --- | --- |
| `→` `Space` `PageDown` `Enter` | Next step / next slide (remotes send PageDown) |
| `←` `PageUp` `Backspace` | Previous step / previous slide (at its last step) |
| `Home` / `End` | First slide / last slide |
| `F` | Fullscreen on/off (for the window you press it in) |
| `T` | Toggle dark / light theme (synced, remembered per browser) |
| `P` | On `/`: open `/presenter` in a new window · On `/presenter`: open `/` (projector window) |
| `1` `2` `3` | Slide 7 only: watermark threshold 2 / 10 / 20 min |
| `A` `U` `C` | Slide 5 only: output mode append / update / complete |
| Click right / left half of the slide | Next / previous (not on buttons) |

Shortcuts are ignored when Ctrl/Alt/⌘ is held, so browser shortcuts (Ctrl+P, Ctrl+R…) keep working.

## Presenting with a second screen

1. Laptop + projector as an **extended** desktop (not mirrored). Use one browser (same profile) for both windows: sync uses `BroadcastChannel`, which only links windows of the same browser on the same computer.
2. Open the deck (`/`), drag that window to the projector and press **F**.
3. Press **P** (or open `/presenter` yourself) and keep that window on the laptop: live slide, preview of the next step, notes with `→n` markers (the current one is filled), timers, buttons for prev/next, threshold (slide 7), output mode (slide 5), theme, fullscreen and "Proyector" (opens `/`).
4. Drive from either window or a remote; both follow each other. A window opened later adopts the running position (it never resets the others). Reloading one window also re-syncs it.
5. Timer: press ▶ in the presenter top bar when you start. It also tracks time per speaker (Vau = orange pill, Onai = blue pill).
6. The presenters' names appear **only** in `/presenter` (speaker pill, per-speaker timers and the speaker notes). The projector (`/`) and the PDF (`/print`) never show them.

## PDF backup (`/print`)

Open `/print` → button **Imprimir / Guardar como PDF** (or Ctrl+P) → destination **Save as PDF / Guardar como PDF**, margins **None / Ninguno**, enable **Background graphics / Gráficos de fondo**. Every slide is printed at its final step on its own 1920×1080 page; ambient animations are off and notes are not printed. The **Tema** button switches to the light theme first if you want a paper-friendly PDF.

## Decisions (made without asking)

**Setup**
- The folder name has spaces and capitals (not a valid npm package name), so `create-next-app@latest` was run in a temp folder as `spark-g6` and copied here. Flags: TypeScript, Tailwind, ESLint, App Router, `src/`, npm. Installed: Next 16.4.3, React 19.3.0, Tailwind 4.3.3, motion 14.9.0, lucide-react 1.66.0, qrcode.react 4.2.0, vitest 5.0.5.
- `@types/node` was raised from `^20` to `^22` to satisfy vitest 5's peer range (Node 22 is installed). No other extra dependencies.
- Kept the Next 16.4 scaffold defaults: `cacheComponents` + `partialPrefetching`, and Tailwind through the `@tailwindcss/turbopack` loader (CSS-first `@import "tailwindcss"` + `@theme`, no `tailwind.config.js`). Design tokens are CSS variables on `:root` / `[data-theme="light"]`, mapped to Tailwind colours `bg / surface / edge / fg / muted / accent / ok / bad / info`.
- Fonts via `next/font/google`: Inter (`--font-inter`) and JetBrains Mono (`--font-jetbrains`), self-hosted at build time.
- `vitest.config.mts` (ESM) and `.gitattributes` (LF line endings) were added.

**Deck engine**
- The deck and presenter render on the client after hydration (their state is in the URL hash, which the server can't see); the server sends an empty themed shell. Result: no hydration mismatches. `/print` is fully server-rendered.
- The hash is updated with `history.replaceState`, so browser history doesn't fill up with steps. Editing the hash by hand still works.
- `BroadcastChannel("spark-g6-deck")` messages are `{ type: "state", sender, slide, step, theme, threshold, outputMode }`, plus a `{ type: "hello" }` sent by a newly opened window, which then adopts the state of the windows already running. Remote changes are applied without being echoed back.
- Theme is stored in `localStorage` and applied by a tiny inline script before first paint (no flash). Threshold and output mode are not persisted (defaults 10 min / update; a reloaded window gets them from the other one).
- `Home`/`End` go to slide 1 / slide 12 at step 0. `1/2/3` and `A/U/C` act only on slides 7 and 5.
- Slide transition: fade + 56 px slide, 280 ms. Step reveals: fade + small slide, 300 ms; hidden elements keep their space, so nothing reflows.
- Reduced motion: `MotionConfig reducedMotion="user"` (no movement, only opacity) and all ambient loops stop.
- **Offline (extra):** besides needing no runtime requests, a small service worker (`public/sw.js`, production only) precaches `/`, `/presenter`, `/print` and their hashed assets: pages are network-first (always fresh when online), assets cache-first. This covers a Wi-Fi drop *and* a reload or opening the presenter while offline.

**Slides** (on-screen text is verbatim; additions are small, functional labels)
- Notes: the `(Vau)`/`(Onai)` prefixes from §6 are stored in `speaker`, not in `notes`. `(Tecla 1)`-style cues in slide 7's notes are shown as key badges (text unchanged).
- Slide 2's notes (verbatim) contain no `[→]` markers although the slide has 4 steps: just advance through the four cards while speaking. A test documents this; all other slides have exactly one marker per step.
- Slide 5: the append warning is shown at every step (step 0 included). Added a caption "escrito en el micro-batch N" / "sin micro-batches todavía" above the sink rows, an `—` when nothing is written, and an "A · U · C" key hint.
- Slide 6: the delay arrow carries a small "+5 min" caption.
- Slide 7: windows with no data yet are labelled "sin datos" (dashed). The memory meter counts windows that hold state (with data and not closed), with singular "1 ventana abierta". A watermark earlier than 12:00 (e.g. 11:54) is pinned at the left edge with a "‹". When a window closes it flashes "memoria liberada". The "Llegadas" queue keeps each event's outcome (aceptado / descartado) and its "tarde" / "muy tarde" label, so the three thresholds can be compared at the end. Dropped events fly to the axis, turn red and fall out.
- Slide 8: the "→" in the bottom band is drawn as an arrow icon.
- Slide 9: the row card has a "DataFrame · fila" caption; `prediction: 1 · probabilidad 0,93` is shown on two lines to fit the card.
- Slide 10: the dots flow continuously along the streaming lane; the "se carga en streaming" link is a curved arrow.
- Slide 11: to keep times in order before 03:14:20, the Kafka feed fills progressively during step 0 (03:13:34 → 03:14:16) and then stays still. It is not an endless loop. The suspicious payment is shown on two lines (`03:14:20 · 900 € · BR` / `tarjeta ****4821`). Added "900 € / 45 €" under the ratio. "Detectado en 1,8 s" appears together with ALERTA #2, when the 6th bar crosses the dashed line at 5.
- Slide 12: the QR encodes `window.location.origin`, so it points to whatever URL the deck is served from (your Vercel URL once deployed; `localhost` when run locally).

## Change after review: no presenter names on the projector

Requested after the first delivery (this overrides PROMPT.md §2 "speaker name bottom-left" and the slide 1 footer):

- Slide 1 footer is now `Grupo 6` (was `Grupo 6 · Vau y Onai`).
- The slide chrome no longer shows the speaker name bottom-left, on every slide, on `/` and in `/print`. Only the progress bar and the slide number (`7 / 12`) remain. The presenter's preview of the next slide uses the same chrome, so it has no name either.
- The page metadata description no longer names the presenters.
- Unchanged: `speaker` is still stored per slide in `src/content/slides.ts` and drives the speaker pill and per-speaker timers in `/presenter`. The speaker notes are verbatim and still mention the names (slide 1: "Somos el Grupo 6, Vau y Onai."; slide 7: "Ahora Onai os explica…"). Notes only appear in `/presenter`.

## Change after review: no Real-Time Mode on slide 4

Requested after the first delivery (this overrides PROMPT.md §5, slide 4 step 3, and slide 4's note in §6):

- Slide 4 step 3 now shows only the `Checkpoint → exactly-once` badge. The `Spark 4.1 · Real-Time Mode: milisegundos (consultas sin estado)` badge is gone. Slide 4 still has 3 steps.
- Slide 4's speaker notes no longer include "Y desde Spark 4.1, el Real-Time Mode baja la latencia a milisegundos en consultas sin estado." They now end at "…cada evento cuenta exactamente una vez."
- No other mention of Real-Time Mode or Spark 4.1 was found in `src/`. The deck title "Spark en tiempo real" is unrelated and stays. `PROMPT.md` (the original brief) still mentions it and was left as is.
- `/`, `/presenter` and `/print` all read the same slide component and `src/content/slides.ts`, so all three show the change.

## Known issues / notes

- On slide 7 the watermark line passes *through* the window boxes (they are translucent so you can see where it falls). It crosses part of a window label for a moment; chips are drawn above it.
- `P` uses `window.open` from a key press. Browsers allow that, but if a popup blocker interferes, open `/presenter` manually: it syncs the same way.
- The service worker caches the last deployed version. After a redeploy, an online visit gets the new version immediately (network-first). If you ever need to clear it: DevTools → Application → Service workers → Unregister, then reload.
- `npm audit` reports 16 moderate advisories, all in the ESLint dev toolchain (`minimatch` via eslint plugins). Nothing ships to the browser. Not "fixed" with `--force`: npm's suggested fix would downgrade to `eslint@4.0.0` and `eslint-config-next@0.2.4`.
- In `next dev` with reduced motion enabled, motion logs an informational console warning ("You have Reduced Motion enabled…"). It doesn't appear in production.
- The screenshot/sync harness used for verification (headless Chrome via the DevTools protocol) lives outside the repo; only its output (`screenshots/`) is committed.
