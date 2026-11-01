import { describe, expect, it } from "vitest";
import { STEPS_OF } from "../../content/slides";
import {
  clampPosition,
  formatHash,
  isLastPosition,
  nextPosition,
  parseHash,
  prevPosition,
  progressOf,
} from "./navigation";

describe("deck navigation", () => {
  it("advances steps, then moves to the next slide at step 0", () => {
    expect(nextPosition({ slide: 2, step: 0 }, STEPS_OF)).toEqual({ slide: 2, step: 1 });
    expect(nextPosition({ slide: 2, step: 4 }, STEPS_OF)).toEqual({ slide: 3, step: 0 });
    // slide 1 has 0 steps
    expect(nextPosition({ slide: 1, step: 0 }, STEPS_OF)).toEqual({ slide: 2, step: 0 });
  });

  it("goes back one step, or to the previous slide at its last step", () => {
    expect(prevPosition({ slide: 3, step: 2 }, STEPS_OF)).toEqual({ slide: 3, step: 1 });
    expect(prevPosition({ slide: 8, step: 0 }, STEPS_OF)).toEqual({ slide: 7, step: 5 });
    expect(prevPosition({ slide: 2, step: 0 }, STEPS_OF)).toEqual({ slide: 1, step: 0 });
  });

  it("stops at both ends", () => {
    expect(prevPosition({ slide: 1, step: 0 }, STEPS_OF)).toEqual({ slide: 1, step: 0 });
    const last = { slide: 12, step: 3 };
    expect(nextPosition(last, STEPS_OF)).toEqual(last);
    expect(isLastPosition(last, STEPS_OF)).toBe(true);
  });

  it("walks every slide and step forward and back again", () => {
    const forward = [{ slide: 1, step: 0 }];
    for (;;) {
      const cur = forward[forward.length - 1];
      const nxt = nextPosition(cur, STEPS_OF);
      if (nxt.slide === cur.slide && nxt.step === cur.step) break;
      forward.push(nxt);
    }
    const total = STEPS_OF.reduce((acc, s) => acc + s + 1, 0);
    expect(forward).toHaveLength(total);
    const backward = [forward[forward.length - 1]];
    for (let i = 1; i < forward.length; i++) {
      backward.push(prevPosition(backward[backward.length - 1], STEPS_OF));
    }
    expect(backward.reverse()).toEqual(forward);
  });

  it("parses and formats the URL hash", () => {
    expect(parseHash("#/7/3", STEPS_OF)).toEqual({ slide: 7, step: 3 });
    expect(parseHash("#/7", STEPS_OF)).toEqual({ slide: 7, step: 0 });
    expect(parseHash("#/99/99", STEPS_OF)).toEqual({ slide: 12, step: 3 });
    expect(parseHash("", STEPS_OF)).toBeNull();
    expect(parseHash("#/hola", STEPS_OF)).toBeNull();
    expect(formatHash({ slide: 5, step: 2 })).toBe("#/5/2");
  });

  it("clamps positions and computes progress", () => {
    expect(clampPosition({ slide: 0, step: -3 }, STEPS_OF)).toEqual({ slide: 1, step: 0 });
    expect(progressOf({ slide: 12, step: 3 }, STEPS_OF)).toBe(1);
    expect(progressOf({ slide: 1, step: 0 }, STEPS_OF)).toBeCloseTo(1 / 12);
  });
});
