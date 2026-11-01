import type { CSSProperties, ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export { cx };

/** Standard slide title at the top-left of the 1920×1080 canvas. */
export function SlideTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1
      className={cx(
        "absolute left-[120px] top-[84px] text-title font-semibold tracking-[-0.02em] text-fg",
        className,
      )}
    >
      {children}
    </h1>
  );
}

/** Content area below the title: x 120..1800, y 216..968 (1680 × 752). */
export function Content({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={cx("absolute left-[120px] right-[120px] top-[216px] bottom-[112px]", className)} style={style}>
      {children}
    </div>
  );
}

type Tone = "default" | "accent" | "ok" | "bad" | "info" | "muted";

const TONE_BORDER: Record<Tone, string> = {
  default: "border-edge",
  accent: "border-accent",
  ok: "border-ok",
  bad: "border-bad",
  info: "border-info",
  muted: "border-edge",
};

const TONE_TEXT: Record<Tone, string> = {
  default: "text-fg",
  accent: "text-accent",
  ok: "text-ok",
  bad: "text-bad",
  info: "text-info",
  muted: "text-muted",
};

const TONE_TINT: Record<Tone, string> = {
  default: "bg-surface",
  accent: "bg-accent/12",
  ok: "bg-ok/12",
  bad: "bg-bad/14",
  info: "bg-info/12",
  muted: "bg-surface",
};

export function toneText(tone: Tone): string {
  return TONE_TEXT[tone];
}

export function Card({
  children,
  className,
  tone = "default",
  style,
}: {
  children: ReactNode;
  className?: string;
  tone?: Tone;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx(
        "rounded-[20px] border-2 bg-surface",
        TONE_BORDER[tone],
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

/** Rounded label; `tint` fills with a translucent tone colour. */
export function Pill({
  children,
  tone = "default",
  tint = true,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  tint?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-[10px] rounded-full border-2 px-[20px] py-[6px] font-medium",
        TONE_BORDER[tone],
        TONE_TEXT[tone],
        tint ? TONE_TINT[tone] : "bg-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Horizontal arrow connector (pure SVG, inherits currentColor). */
export function ArrowRightLine({
  width = 72,
  className,
  dashed = false,
}: {
  width?: number;
  className?: string;
  dashed?: boolean;
}) {
  return (
    <svg
      width={width}
      height={28}
      viewBox={`0 0 ${width} 28`}
      className={cx("shrink-0 text-muted", className)}
      aria-hidden
    >
      <line
        x1={2}
        y1={14}
        x2={width - 14}
        y2={14}
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={dashed ? "10 10" : undefined}
      />
      <path
        d={`M ${width - 18} 4 L ${width - 3} 14 L ${width - 18} 24`}
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("text-small font-semibold uppercase tracking-[0.14em] text-accent", className)}>
      {children}
    </div>
  );
}
