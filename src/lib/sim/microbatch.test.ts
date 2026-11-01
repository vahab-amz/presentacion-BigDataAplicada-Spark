import { describe, expect, it } from "vitest";
import { APPEND_WARNING, formatResultRow, simulateMicrobatch, type SinkOutput } from "./microbatch";
import { OUTPUT_MODES } from "./types";

function written(sink: SinkOutput): string[] | string {
  return sink.kind === "rows" ? sink.rows.map(formatResultRow) : sink.message;
}

describe("micro-batch stepper · sink per step and output mode", () => {
  const expected: Record<string, Array<string[] | string>> = {
    update: [[], ["12:00–12:05 → 2", "12:05–12:10 → 1"], ["12:05–12:10 → 2"]],
    complete: [[], ["12:00–12:05 → 2", "12:05–12:10 → 1"], ["12:00–12:05 → 2", "12:05–12:10 → 2"]],
    append: [APPEND_WARNING, APPEND_WARNING, APPEND_WARNING],
  };

  for (const mode of OUTPUT_MODES) {
    for (let step = 0; step <= 2; step++) {
      it(`${mode} · step ${step}`, () => {
        expect(written(simulateMicrobatch(step, mode).sink)).toEqual(expected[mode][step]);
      });
    }
  }
});

describe("micro-batch stepper · tables", () => {
  it("step 0: tables empty", () => {
    const s = simulateMicrobatch(0, "update");
    expect(s.input).toHaveLength(0);
    expect(s.result).toHaveLength(0);
    expect(s.processed).toBe(0);
  });

  it("step 1: micro-batch 1 processes 3 events", () => {
    const s = simulateMicrobatch(1, "update");
    expect(s.input.map((r) => r.clock)).toEqual(["12:01", "12:02", "12:06"]);
    expect(s.result.map(formatResultRow)).toEqual(["12:00–12:05 → 2", "12:05–12:10 → 1"]);
    expect(s.processed).toBe(3);
    expect(s.changed).toEqual(["12:00–12:05", "12:05–12:10"]);
  });

  it("step 2: micro-batch 2 processes only 12:07", () => {
    const s = simulateMicrobatch(2, "update");
    expect(s.input.map((r) => [r.clock, r.batch])).toEqual([
      ["12:01", 1],
      ["12:02", 1],
      ["12:06", 1],
      ["12:07", 2],
    ]);
    expect(s.processed).toBe(1);
    expect(s.changed).toEqual(["12:05–12:10"]);
    expect(s.result.map(formatResultRow)).toEqual(["12:00–12:05 → 2", "12:05–12:10 → 2"]);
  });

  it("is deterministic and clamps the step", () => {
    expect(simulateMicrobatch(2, "complete")).toEqual(simulateMicrobatch(2, "complete"));
    expect(simulateMicrobatch(9, "update")).toEqual(simulateMicrobatch(2, "update"));
  });
});
