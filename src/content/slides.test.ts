import { describe, expect, it } from "vitest";
import { STEP_MARKER, noteSegments, slides } from "./slides";

describe("slides content", () => {
  it("has 12 slides with ids 1..12", () => {
    expect(slides.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("has one [→] marker per step (slide 2's verbatim notes have none)", () => {
    for (const s of slides) {
      const markers = s.notes.split(STEP_MARKER).length - 1;
      if (s.id === 2) {
        expect(markers).toBe(0);
      } else {
        expect(markers, `slide ${s.id}`).toBe(s.steps);
      }
      expect(noteSegments(s.notes)).toHaveLength(markers + 1);
    }
  });

  it("assigns speakers: Vau 1–7, Onai 8–12", () => {
    expect(slides.filter((s) => s.speaker === "Vau").map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(slides.filter((s) => s.speaker === "Onai").map((s) => s.id)).toEqual([8, 9, 10, 11, 12]);
  });
});
