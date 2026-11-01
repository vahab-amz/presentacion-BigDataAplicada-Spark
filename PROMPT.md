# Build: "Spark en tiempo real" — web presentation (Grupo 6)

You are building a web-based slide deck for a university class presentation **tomorrow morning**. Work fully **unattended for ~60 minutes**. Do not ask questions: make the most reasonable decision, write it down in `REPORT.md`, and keep going. Follow the milestones in order; after each one, `npm run build` must pass and you commit with git. If time runs short, M1–M3 must be finished and working; everything after is a bonus.

**Do NOT deploy.** The owner deploys to Vercel himself.

All on-screen text and speaker notes are in **Spanish** and are given verbatim below. Do not rewrite them.

---

## 1. Stack and rules

- Scaffold non-interactively with `create-next-app@latest`: TypeScript, Tailwind CSS, App Router, `src/` dir, ESLint, npm. Check the installed versions of `next`, `react` and `tailwindcss` in `package.json` and use the current APIs for those exact versions (Next.js 16.x, React 19, Tailwind v4). Never use deprecated patterns.
- Tailwind **v4** only: CSS-first config with `@import "tailwindcss";` and `@theme` in `globals.css`. No `tailwind.config.js`.
- Extra dependencies, and nothing else: `motion` (import from `"motion/react"`, only in client components), `lucide-react` (icons), `qrcode.react` (QR on the last slide), `vitest` (dev, for the simulation logic tests).
- TypeScript strict, no `any`.
- Server Components by default; `"use client"` only where needed (the deck engine and the interactive slides).
- Fonts via `next/font/google`: Inter (text) and JetBrains Mono (data/code). No layout shift.
- Respect `prefers-reduced-motion`: ambient loops stop and transitions become instant fades.
- Everything is static and client-side. No API routes, no backend, no env vars, no external requests at runtime. After first load the deck must work offline (class Wi-Fi is unreliable).
- All simulations are **deterministic** and **step-driven** (see §3). Same input, same result, every time.
- No real brand logos (no Apache Spark logo, no real bank names). The bank is fictional: "Banco Demo".

## 2. Visual design

Theme "centro de control antifraude": dark, calm, high contrast, one strong accent. Minimal text on slides; big type.

Design tokens (CSS variables, dark by default; a light theme via `[data-theme="light"]` for weak projectors):

| Token | Dark | Light |
| --- | --- | --- |
| `--bg` | `#0B0F17` | `#F7F8FA` |
| `--surface` | `#121826` | `#FFFFFF` |
| `--border` | `#243045` | `#D9DEE7` |
| `--text` | `#E6EAF2` | `#0F172A` |
| `--muted` | `#8A94A7` | `#5B6475` |
| `--accent` | `#FF6A1A` | `#E5550A` |
| `--ok` | `#22C55E` | `#16A34A` |
| `--bad` | `#EF4444` | `#DC2626` |
| `--info` | `#38BDF8` | `#0284C7` |

- Stage: every slide is laid out on a fixed **1920×1080** canvas, scaled with `transform: scale()` to fit the viewport (letterboxed, centered). This guarantees identical layout on any projector.
- Type on the 1920 canvas: slide titles 72px semibold; body ≥ 32px; data/mono ≥ 28px; small captions ≥ 22px.
- Slide chrome: thin progress bar at the top (accent), slide number bottom-right (`7 / 12`), speaker name bottom-left in muted text (`Vau` or `Onai`).
- Slide transition: short fade + slight slide (≤ 300 ms).
- Reveal steps: elements fade/slide in; already-revealed elements stay.

## 3. Deck engine

- Single route `/` renders the deck. State lives in the URL hash: `#/<slide>/<step>` (1-based slide, 0-based step), so a reload keeps the position.
- Each slide declares `steps: number`. **Next** advances the step until `step === steps`, then goes to the next slide at step 0. **Previous** goes back one step, or to the previous slide at its last step.
- Keys: `→`, `Space`, `PageDown`, `Enter` = next. `←`, `PageUp`, `Backspace` = previous. `Home`/`End` = first/last slide. `F` = fullscreen. `T` = toggle theme. `P` = open `/presenter` in a new window. `1`/`2`/`3` = threshold preset on slide 7 (2 / 10 / 20 min). `A`/`U`/`C` = output mode on slide 5. Clicking the right/left half of the stage also navigates (except on interactive controls).
- Presentation remotes send `PageDown`/`PageUp`, so those must work everywhere.
- Each interactive slide is a pure function of `(step, local controls)`. When a slide is entered from the previous slide it starts at step 0; when entered backwards it shows its final state.
- Sync: a `BroadcastChannel("spark-g6-deck")` broadcasts `{ slide, step, theme, threshold, outputMode }` on every change and applies incoming messages, so `/` and `/presenter` stay in sync in both directions.

## 4. Content model

Put all content in `src/content/slides.ts`:

```ts
type Speaker = "Vau" | "Onai";
interface SlideDef {
  id: number;            // 1..12
  speaker: Speaker;
  title: string;
  steps: number;
  notes: string;         // speaker notes, verbatim from §6; "[→]" marks a step advance
  component: string;     // key of the slide component
}
```

Speaker notes render in the presenter view, with each `[→]` shown as a small accent marker.

## 5. Slides

Each slide below lists: speaker, steps, layout, and behaviour. On-screen text is verbatim.

### Slide 1 · Portada (Vau, steps 0)
- Kicker: `Big Data Aplicado · Actividad de investigación Spark`
- Title: `Spark en tiempo real`
- Subtitle: `Structured Streaming y MLlib`
- Footer: `Grupo 6 · Vau y Onai`
- Background: subtle ambient animation of small data points flowing left→right along a few horizontal lines (canvas or CSS, cheap, paused under reduced motion).

### Slide 2 · Nuestro tema (Vau, steps 4)
Title `Nuestro tema`. Four cards, revealed one per step:
1. `1 · Structured Streaming` / `La tabla infinita`
2. `2 · Watermarking` / `Datos con retraso`
3. `3 · MLlib` / `Transformers, Estimators, Pipelines`
4. `Caso de uso` / `Detección de fraude bancario` (accent border)

### Slide 3 · El stream como tabla infinita (Vau, steps 3)
- Left: an ambient stream of small event chips (`pago`, `clic`, `sensor`) flowing into a table on the right; the table keeps appending rows at the bottom (ambient loop, capped DOM size: recycle rows). Table label: `Input table · sin fin`.
- Right column bullets, one per step:
  1. `Cada evento = una fila nueva`
  2. `Mismo código que en batch: DataFrame / SQL`
  3. `Spark procesa solo lo nuevo: micro-batches + estado`

### Slide 4 · Una consulta de streaming (Vau, steps 3)
- Step 1: flow diagram with three boxes and arrows: `Fuente · Kafka` → `Consulta · transformación` → `Destino · sink`.
- Step 2: three output-mode cards: `append` / `solo filas nuevas`; `update` / `solo filas que cambian`; `complete` / `toda la tabla`.
- Step 3: two badges: `Checkpoint → exactly-once` and `Spark 4.1 · Real-Time Mode: milisegundos (consultas sin estado)`.

### Slide 5 · Ejemplo: pagos cada 5 minutos (Vau, steps 2) — interactive
Pure logic in `src/lib/sim/microbatch.ts` with tests.

Layout, left to right:
- `Input table` (column `event_time`).
- Query chip in mono: `groupBy(window(event_time, "5 min")).count()`.
- `Result table` (columns `ventana`, `count`).
- Bottom: `Sink` box with an output-mode toggle `append | update | complete` (default `update`; keys A/U/C; clickable). It shows the rows written in the current micro-batch.

Data and steps:
- Step 0: tables empty. Caption: `Esperando datos…`
- Step 1 = micro-batch 1: rows `12:01`, `12:02`, `12:06` animate into the input table. Result: `12:00–12:05 → 2`, `12:05–12:10 → 1`. Badge `Micro-batch 1 · 3 eventos procesados`.
- Step 2 = micro-batch 2: row `12:07` animates in and is highlighted `procesado`; earlier rows dim with label `ya procesados`. Result counter `12:05–12:10` animates 1 → 2. Badge `Micro-batch 2 · 1 evento procesado`.
- Sink per mode:
  - `update`: step 1 writes both rows; step 2 writes only `12:05–12:10 → 2`.
  - `complete`: writes the full result table every step.
  - `append`: shows a warning card instead of rows: `append + agregación requiere watermark`.

Tests: for each step and mode, the written rows match the above.

### Slide 6 · Event time vs processing time (Vau, steps 4)
1. A payment card with two clocks: `Event time · 12:04` / `cuándo ocurrió` and `Processing time · 12:09` / `cuándo llegó`, joined by a dashed delay arrow with the icon and label `sin cobertura`.
2. Problem line: `Ventanas abiertas = estado en memoria → crece sin fin`.
3. Big formula in mono: `watermark = máx(event time) − umbral`.
4. Two trade-off chips: `Umbral grande: + precisión · + memoria` and `Umbral pequeño: − memoria · − precisión`.

### Slide 7 · Watermark en acción (Vau, steps 5) — interactive, the centrepiece
Pure logic in `src/lib/sim/watermark.ts` with tests.

Model (simplification shown as a caption: `Simplificación: 1 evento = 1 micro-batch`):
- Tumbling windows of 10 minutes: `[12:00, 12:10)`, `[12:10, 12:20)`, `[12:20, 12:30)`.
- Events in **arrival order**: `12:04`, `12:14`, `12:07` (label `tarde`), `12:25`, `12:03` (label `muy tarde`).
- Threshold presets: 2, 10 (default), 20 minutes.
- For each arriving event, in order:
  1. Its window is **closed** if `currentWatermark >= window.end`. Closed → the event is `descartado`. Open → `aceptado`, the window count +1.
  2. Then `maxEventTime = max(maxEventTime, event)`, `watermark = maxEventTime − threshold`.
  3. Then every window with `window.end <= watermark` becomes closed and its state is freed.
- Initial watermark is −∞ (displayed as `—`).

Expected results (write these as tests):

| Threshold | 12:04 | 12:14 | 12:07 | 12:25 | 12:03 | Final counts [00–10, 10–20, 20–30] | Open windows at end |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10 min | aceptado | aceptado | aceptado | aceptado | descartado | 2, 1, 1 | 2 (10–20, 20–30) |
| 2 min | aceptado | aceptado | descartado | aceptado | descartado | 1, 1, 1 | 1 (20–30) |
| 20 min | aceptado | aceptado | aceptado | aceptado | aceptado | 3, 1, 1 | 3 |

Watermark after each event at 10 min: 11:54, 12:04, 12:04, 12:15, 12:15.

Layout:
- Top: horizontal event-time axis 12:00 → 12:30 with the three window boxes. Each box shows its count and state: open = accent outline + label `abierta · en memoria`; closed = grey + lock icon + label `cerrada`, with a short "state freed" animation when it closes.
- A vertical **watermark line** (accent, labelled `watermark 12:04`) that animates along the axis; a thinner muted marker `máx. event time`.
- Bottom-left: `Llegadas` queue with the five event chips in arrival order. On each step the next chip flies to its position on the axis and turns green `aceptado` (and increments the window), or red `descartado` and drops out with a fade.
- Right panel `Cálculo` (mono): `máx. event time = …`, `umbral = 10 min`, `watermark = …`, plus a memory meter `Memoria: N ventanas abiertas`.
- Threshold control: segmented buttons `2 min | 10 min | 20 min` (keys 1/2/3). Changing it keeps the current step and recomputes instantly with animation, so the presenter can compare at the end.

### Slide 8 · MLlib: tres piezas (Onai, steps 4)
1. Card `Transformer` · mono `transform()` · `DataFrame → DataFrame · no aprende` · example `VectorAssembler`.
2. Card `Estimator` · mono `fit()` · `Aprende → devuelve un Transformer` · example `RandomForestClassifier`.
3. Card `Pipeline` · `Cadena de etapas · es un Estimator` · `fit() → PipelineModel`.
4. Bottom band: `Entrenar en batch → aplicar en streaming` and small footer `API actual: pyspark.ml (DataFrames)`.

### Slide 9 · Un Pipeline para fraude (Onai, steps 4) — interactive
A horizontal conveyor with three stations: `StringIndexer` (tag `Estimator`), `VectorAssembler` (tag `Transformer`), `RandomForestClassifier` (tag `Estimator`). Above it a label `pipeline.fit(histórico)`.

A DataFrame row card travels along the conveyor; columns are added as it passes each station (new column highlighted):
- Step 0: `importe: 900 · hora: 3 · pais: "BR"`
- Step 1 (after StringIndexer): adds `pais_idx: 2`, with a small mapping legend `ES → 0 · FR → 1 · BR → 2`.
- Step 2 (after VectorAssembler): adds `features: [900, 3, 2]`.
- Step 3 (after RandomForest): adds `prediction: 1 · probabilidad 0,93` and a red badge `FRAUDE`.
- Step 4: the three stations collapse into one box `PipelineModel` with a save icon and label `guardado · listo para streaming`.

### Slide 10 · Caso de uso: detección de fraude bancario (Onai, steps 3)
Two horizontal lanes:
- Step 1 · top lane `Batch · el pasado`: `Histórico (Parquet)` → `ETL: limpieza + variables (hora, gasto medio 30 días)` → `Entrenar Pipeline` → `PipelineModel`. Plus a note chip: `Fraude ≈ 0,1 % → pesos por clase, no accuracy`.
- Step 2 · bottom lane `Streaming · el presente`: `Kafka` → `Structured Streaming` → `Join con perfil del cliente` → `Modelo · transform()` → `Ventana 2 min + watermark 10 min` → `Alertas · base de datos`. Small dots flow continuously along this lane (ambient).
- Step 3: a vertical arrow from `PipelineModel` down to `Modelo · transform()` labelled `se carga en streaming`, and a badge `checkpoint · sin perder ni duplicar alertas`.

### Slide 11 · 3:14 · el viaje de un pago (Onai, steps 5) — interactive, the second centrepiece
Three columns. A small caption bottom-right: `Simulación`.

- Left · `Kafka · topic pagos`: a live feed of normal payments scrolling slowly (ambient, deterministic list, green `OK` tags), e.g. `03:13:52 · 12,40 € · ES`, `03:13:58 · 4,10 € · ES`, `03:14:05 · 31,00 € · ES`…
- Center · pipeline stages that light up in sequence.
- Right · a generic phone mockup (rounded rectangle, lock screen with the time `3:14`), and below it a small sliding-window bar chart.

Steps:
1. The suspicious payment enters the feed, highlighted in accent: `03:14:20 · 900 € · BR · tarjeta ****4821`.
2. Center: stage `Join perfil del cliente` lights up showing `gasto medio: 45 €`; a counter animates `ratio ×1 → ×20`.
3. Center: stage `Modelo` lights up; a semicircular gauge sweeps to `0,93`; red card `ALERTA #1 · modelo`.
4. Right: the phone shows a push notification from `Banco Demo`: `¿Has realizado este pago de 900 € en Brasil?` with two buttons `Sí, fui yo` / `No, bloquear tarjeta`.
5. Right: the sliding-window chart `Compras en los últimos 2 min` counts up 1 → 6 with a dashed threshold line at 5; when it crosses, red card `ALERTA #2 · ventana 2 min`. At the same time a big clock shows `Detectado en 1,8 s`.

### Slide 12 · En resumen (Onai, steps 3)
Title `En resumen`. One line per step:
1. `Structured Streaming: el tiempo real como tabla infinita`
2. `Watermark: equilibrio entre precisión y memoria`
3. `MLlib: entrenar en batch, aplicar en streaming`

Always visible: footer `Una única plataforma para analítica en tiempo real y predictiva`, a large `¿Preguntas?`, and a QR code (`QRCodeSVG` from `qrcode.react`) of `window.location.origin`, rendered client-side only, with the caption `Explora la presentación`.

## 6. Speaker notes (verbatim, Spanish)

1. (Vau) Buenos días. Somos el Grupo 6, Vau y Onai.
2. (Vau) Nuestro tema son dos librerías construidas sobre los DataFrames: Structured Streaming, para datos en tiempo real, y MLlib, para Machine Learning. Responderemos tres preguntas: cómo funciona la tabla infinita, qué es el watermarking y cuáles son los componentes de MLlib. Terminaremos con un caso de uso real.
3. (Vau) Un stream es un flujo de eventos que nunca termina, como pagos o clics. [→] Structured Streaming lo trata como una tabla infinita: cada evento es una fila nueva que se añade al final. [→] Por eso podemos usar el mismo código de DataFrame o SQL que en batch. [→] Pero Spark no recalcula toda la tabla: guarda un estado con los resultados parciales y procesa solo los eventos nuevos, en pequeños lotes llamados micro-batches.
4. (Vau) [→] Una consulta tiene una fuente, normalmente Kafka, una transformación y un destino. [→] El output mode decide qué se escribe: solo lo nuevo, solo lo que cambia o toda la tabla. [→] El checkpoint guarda el progreso y el estado: si la aplicación se cae, continúa donde lo dejó y cada evento cuenta exactamente una vez. Y desde Spark 4.1, el Real-Time Mode baja la latencia a milisegundos en consultas sin estado.
5. (Vau) Veámoslo con un ejemplo: contamos pagos en ventanas de cinco minutos. [→] En el primer micro-batch llegan pagos de las 12:01, 12:02 y 12:06: dos en la ventana de 12:00 a 12:05 y uno en la de 12:05 a 12:10. [→] En el segundo llega uno de las 12:07: Spark solo procesa ese pago, y la segunda ventana pasa a dos. En modo update, solo se escribe esa fila.
6. (Vau) Pregunta dos. [→] Cada evento tiene dos tiempos: el event time, cuándo ocurrió de verdad, y el processing time, cuándo llegó a Spark. Analizamos por event time. Pero los datos pueden llegar tarde, por ejemplo desde un dispositivo sin conexión. [→] Para corregir una ventana, Spark guarda su estado en memoria; si guardara todas para siempre, la memoria crecería sin límite. [→] El watermark lo resuelve: se calcula como el event time máximo visto menos el umbral, y cuando supera el final de una ventana, esta se cierra y los datos posteriores se descartan. [→] Es un compromiso: un umbral grande da más precisión pero usa más memoria; uno pequeño, al revés.
7. (Vau) Veámoslo en directo, con ventanas de diez minutos y un umbral de diez. [→] Llega 12:04: entra en su ventana. [→] Llega 12:14: el watermark pasa a 12:04 y la ventana sigue abierta. [→] Llega tarde 12:07: se acepta. [→] Llega 12:25: el watermark sube a 12:15 y la ventana se cierra. [→] Y el de las 12:03 llega demasiado tarde: se descarta. (Tecla 1) Con un umbral de dos minutos, hasta el de las 12:07 se pierde. (Tecla 3) Con veinte, se cuentan todos, pero las ventanas ocupan memoria más tiempo. (Tecla 2) Hasta aquí, cómo procesar datos en tiempo real. Ahora Onai os explica cómo aprender de ellos con MLlib.
8. (Onai) Pregunta tres. MLlib es la librería de Machine Learning de Spark: distribuye el entrenamiento por el clúster, y su API actual es pyspark.ml, basada en DataFrames. Tiene tres componentes. [→] El Transformer, con transform, convierte un DataFrame en otro sin aprender nada. [→] El Estimator, con fit, aprende de los datos y devuelve un Transformer: el modelo entrenado. [→] Y el Pipeline encadena varias etapas. Es también un Estimator: al hacer fit, entrena cada etapa en orden y devuelve un PipelineModel que se guarda y se reutiliza. Así la preparación de los datos es la misma en entrenamiento y en producción. [→] Lo habitual es entrenar en batch y aplicar el modelo en streaming.
9. (Onai) Un ejemplo para detectar fraude. [→] StringIndexer, un Estimator, convierte el país en un número. [→] VectorAssembler, un Transformer, junta el importe, la hora y el país en un vector. [→] Y RandomForestClassifier, un Estimator, aprende a detectar el fraude. [→] Con fit sobre el histórico obtenemos un PipelineModel que clasifica cada pago nuevo.
10. (Onai) Nuestro caso combina ETL batch, analítica predictiva y streaming. [→] La parte batch trabaja con el pasado: limpia el histórico, crea variables como la hora o el gasto medio del cliente en treinta días y entrena el Pipeline. Como el fraude es muy raro, alrededor del 0,1 %, damos más peso a los fraudes y no usamos la accuracy como métrica. [→] La parte streaming trabaja con el presente: los pagos llegan por Kafka, se unen al perfil del cliente y el modelo los clasifica. Además, una ventana deslizante con un watermark de diez minutos detecta más de cinco compras en dos minutos. [→] Las alertas van a una base de datos, con checkpoint para no perder ni duplicar ninguna.
11. (Onai) Veámoslo en directo. [→] Son las 3:14 de la madrugada: alguien paga 900 euros en Brasil con la tarjeta de un cliente. [→] El pago entra por Kafka y se une a su perfil: gasta 45 euros de media, así que este pago es veinte veces su media. [→] El modelo lo clasifica como fraude y lanza una alerta, [→] y el cliente recibe un aviso al instante. [→] A la vez, la ventana detecta seis compras en dos minutos y lanza una segunda alerta. Todo en segundos.
12. (Onai) [→] En resumen: Structured Streaming trata el tiempo real como una tabla infinita, [→] el watermark equilibra precisión y memoria con los datos tardíos, [→] y MLlib entrena en batch y aplica en streaming. Juntos hacen de Spark una única plataforma para analítica en tiempo real y predictiva. Gracias, ¿alguna pregunta?

## 7. Presenter view `/presenter`

- Left (large): the current slide, live, scaled.
- Right top: preview of the next step/slide, scaled small.
- Right: speaker notes for the current slide in 30px+ text, `[→]` rendered as accent markers; the marker matching the current step is highlighted.
- Top bar: speaker name (`Vau` / `Onai`) as a coloured pill, slide `n / 12`, step `s / steps`, elapsed timer (start/pause/reset), and a per-speaker timer.
- Buttons: previous / next, threshold 2/10/20 (visible on slide 7), output mode A/U/C (visible on slide 5), theme toggle.
- Same keyboard shortcuts. Synced with `/` via `BroadcastChannel` both ways.

## 8. Print fallback `/print`

All 12 slides stacked, each at its **final step**, one per page: `@page { size: 1920px 1080px; margin: 0 }`, `break-after: page`. Ambient animations off. Speaker notes are not printed. This is the PDF backup if the laptop or projector fails.

## 9. Milestones (in this order)

- **M1 · Deck + all slides static (must).** Scaffold, tokens, fonts, stage scaling, deck engine with steps, hash URL, keyboard, fullscreen, theme toggle, `BroadcastChannel` sync, `slides.ts` with all notes. All 12 slides with their step reveals. Interactive slides (5, 7, 9, 11) at this stage show a clean static version of their final state, so the deck is presentable even if later milestones are not reached. Build passes. Commit.
- **M2 · Watermark simulator, slide 7 (must).** `watermark.ts` + vitest tests for the three thresholds (table above) + full animated UI + threshold control. Commit.
- **M3 · El viaje de un pago, slide 11 (must).** All five steps with animations, phone mockup, gauge, sliding-window chart. Commit.
- **M4 · Presenter view.** Commit.
- **M5 · Micro-batch stepper, slide 5.** `microbatch.ts` + tests + UI with the output-mode toggle. Commit.
- **M6 · Pipeline conveyor, slide 9.** Commit.
- **M7 · Polish.** `/print`, QR on slide 12, ambient animations on slides 1, 3, 10, reduced-motion support, light theme check, metadata title `Spark en tiempo real · Grupo 6`. Commit.

## 10. Verification before you finish

- `npm run lint`, `npx vitest run` and `npm run build` all pass with no errors.
- Walk through every slide and step via the hash URL logic; going backward from slide 8 lands on slide 7 at step 5.
- No console errors or hydration warnings.
- If a headless browser is available, screenshot every slide at its final step into `screenshots/` and check for overflow or overlapping text at 1920×1080. If not, skip this.

## 11. REPORT.md

Write `REPORT.md` with: milestones done / not done, decisions you made, how to run (`npm run dev`, `npm run build && npm run start`), the full keyboard shortcut list, how to use `/presenter` with a second screen (open `/` on the projector in fullscreen, `/presenter` on the laptop), how to export the PDF from `/print`, and known issues.
