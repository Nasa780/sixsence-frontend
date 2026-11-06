import { describe, expect, it } from "vitest";
import { RELEASES } from "./releases";

const TAGS = ["Site", "Classé", "Division", "Tournoi", "Discord", "GTA 6"];

describe("journal des nouveautés", () => {
  it("va de la plus récente à la plus ancienne", () => {
    const dates = RELEASES.map((release) => release.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("donne un titre, une date valide et au moins une ligne", () => {
    for (const release of RELEASES) {
      expect(release.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(release.title).toBeTruthy();
      expect(release.items.length).toBeGreaterThan(0);
    }
  });

  it("n'utilise que les étiquettes connues", () => {
    for (const item of RELEASES.flatMap((release) => release.items)) expect(TAGS).toContain(item.tag);
  });
});
