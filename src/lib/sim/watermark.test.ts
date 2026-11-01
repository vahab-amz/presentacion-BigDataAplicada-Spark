import { describe, expect, it } from "vitest";
import { formatClock, type Threshold } from "./types";
import { EVENTS, WINDOWS, formatMaybeClock, simulateWatermark } from "./watermark";

const FINAL = EVENTS.length;

describe("watermark simulator · expected results", () => {
  const table: Array<{
    threshold: Threshold;
    statuses: string[];
    counts: number[];
    open: number;
    openLabels: string[];
  }> = [
    {
      threshold: 10,
      statuses: ["aceptado", "aceptado", "aceptado", "aceptado", "descartado"],
      counts: [2, 1, 1],
      open: 2,
      openLabels: ["[12:10, 12:20)", "[12:20, 12:30)"],
    },
    {
      threshold: 2,
      statuses: ["aceptado", "aceptado", "descartado", "aceptado", "descartado"],
      counts: [1, 1, 1],
      open: 1,
      openLabels: ["[12:20, 12:30)"],
    },
    {
      threshold: 20,
      statuses: ["aceptado", "aceptado", "aceptado", "aceptado", "aceptado"],
      counts: [3, 1, 1],
      open: 3,
      openLabels: ["[12:00, 12:10)", "[12:10, 12:20)", "[12:20, 12:30)"],
    },
  ];

  for (const row of table) {
    it(`threshold ${row.threshold} min`, () => {
      const s = simulateWatermark(row.threshold, FINAL);
      expect(s.outcomes.map((o) => o.status)).toEqual(row.statuses);
      expect(s.windows.map((w) => w.count)).toEqual(row.counts);
      expect(s.openWindows).toBe(row.open);
      expect(s.windows.filter((w) => w.status === "abierta").map((w) => w.label)).toEqual(row.openLabels);
    });
  }

  it("watermark after each event at 10 min: 11:54, 12:04, 12:04, 12:15, 12:15", () => {
    const marks = [1, 2, 3, 4, 5].map((step) => formatMaybeClock(simulateWatermark(10, step).watermark));
    expect(marks).toEqual(["11:54", "12:04", "12:04", "12:15", "12:15"]);
  });
});

describe("watermark simulator · mechanics", () => {
  it("starts empty with watermark −∞ (shown as —)", () => {
    const s = simulateWatermark(10, 0);
    expect(s.watermark).toBeNull();
    expect(s.maxEventTime).toBeNull();
    expect(formatMaybeClock(s.watermark)).toBe("—");
    expect(s.outcomes).toHaveLength(0);
    expect(s.windows.map((w) => w.status)).toEqual(["vacía", "vacía", "vacía"]);
    expect(s.openWindows).toBe(0);
  });

  it("closes [12:00, 12:10) when 12:25 arrives with a 10-minute threshold", () => {
    expect(simulateWatermark(10, 3).windows[0].closed).toBe(false);
    const s = simulateWatermark(10, 4);
    expect(s.windows[0].closed).toBe(true);
    expect(s.windows[0].closedAtStep).toBe(4);
    expect(formatClock(s.maxEventTime ?? 0)).toBe("12:25");
  });

  it("is deterministic and clamps the step", () => {
    expect(simulateWatermark(2, 3)).toEqual(simulateWatermark(2, 3));
    expect(simulateWatermark(10, 99)).toEqual(simulateWatermark(10, FINAL));
    expect(simulateWatermark(10, -1)).toEqual(simulateWatermark(10, 0));
  });

  it("stacks accepted events per window in arrival order", () => {
    const s = simulateWatermark(20, FINAL);
    const rowsInFirst = s.outcomes.filter((o) => o.windowIndex === 0).map((o) => [o.event.clock, o.row]);
    expect(rowsInFirst).toEqual([
      ["12:04", 0],
      ["12:07", 1],
      ["12:03", 2],
    ]);
    expect(s.outcomes.every((o) => o.windowIndex >= 0 && o.windowIndex < WINDOWS.length)).toBe(true);
  });
});
