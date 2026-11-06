import { describe, expect, it } from "vitest";
import { roundsToWin } from "./matchRules";

describe("format des matchs", () => {
  it("joue en 8 manches en BO1, en 6 au-delà", () => {
    expect(roundsToWin(1)).toBe(8);
    expect(roundsToWin(3)).toBe(6);
    expect(roundsToWin(5)).toBe(6);
  });
});
