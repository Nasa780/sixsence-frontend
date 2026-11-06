import { describe, expect, it } from "vitest";
import { RANKS, levelFor, nextRank, rankFor, rankLevel } from "./ranks";

describe("rangs", () => {
  it("donne le bon rang à chaque seuil", () => {
    expect(rankFor(0).name).toBe("Bronze");
    expect(rankFor(299).name).toBe("Bronze");
    expect(rankFor(300).name).toBe("Argent");
    expect(rankFor(3000).name).toBe("Légende");
  });

  it("garde les rangs du plus haut au plus bas", () => {
    const seuils = RANKS.map((rank) => rank.min);
    expect(seuils).toEqual([...seuils].sort((a, b) => b - a));
    expect(seuils.at(-1)).toBe(0);
  });

  it("numérote les rangs depuis Bronze", () => {
    expect(rankLevel(rankFor(0))).toBe(1);
    expect(rankLevel(rankFor(3000))).toBe(RANKS.length);
  });

  it("indique le rang suivant, sauf au sommet", () => {
    expect(nextRank(100).rank.name).toBe("Argent");
    expect(nextRank(3500).rank).toBeFalsy();
  });

  it("démarre au niveau 1", () => {
    expect(levelFor(0)).toBe(1);
  });
});
