"use client";

import { cx } from "./primitives";

interface SegmentedProps<T extends string | number> {
  options: ReadonlyArray<{ value: T; label: string; hint?: string }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  ariaLabel: string;
}

/** Segmented buttons (e.g. `2 min | 10 min | 20 min`). Never triggers slide navigation. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  className,
  size = "md",
  ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-interactive
      className={cx("inline-flex rounded-[16px] border-2 border-edge bg-bg p-[4px]", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            title={opt.hint}
            onClick={() => onChange(opt.value)}
            onMouseDown={(e) => e.preventDefault()}
            className={cx(
              "cursor-pointer whitespace-nowrap rounded-[11px] font-mono font-semibold transition-colors duration-200",
              size === "lg"
                ? "px-[26px] py-[10px] text-[28px]"
                : size === "sm"
                  ? "px-[12px] py-[5px] text-[16px]"
                  : "px-[16px] py-[8px] text-[26px]",
              active ? "bg-accent text-bg" : "text-muted hover:text-fg",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
