import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./auth", () => ({ getAccessToken: async () => null }));
vi.mock("./config", () => ({ API_URL: "https://api.test" }));

const { api, ApiError } = await import("./api");

/** Réponse factice de fetch. */
function reply(status, body) {
  return { status, ok: status >= 200 && status < 300, json: async () => body };
}

describe("api : limite de requêtes (429)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("réessaie en silence puis renvoie la réponse", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(reply(429, { error: { code: "RATE_LIMITED", message: "Trop de requêtes. Patiente un instant." } }))
      .mockResolvedValueOnce(reply(200, { clips: [] }));
    vi.stubGlobal("fetch", fetch);

    const promise = api("/clips");
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toEqual({ clips: [] });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("abandonne après trois nouvelles tentatives, avec un message lisible", async () => {
    const fetch = vi.fn().mockResolvedValue(reply(429, { error: { code: "RATE_LIMITED", message: "Trop de requêtes. Patiente un instant." } }));
    vi.stubGlobal("fetch", fetch);

    const promise = api("/cod/pass");
    const check = expect(promise).rejects.toMatchObject({ status: 429, code: "RATE_LIMITED" });
    await vi.runAllTimersAsync();
    await check;
    expect(fetch).toHaveBeenCalledTimes(4);
    await promise.catch((error) => {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).not.toContain("Trop de requêtes");
    });
  });

  it("ne réessaie pas les autres erreurs", async () => {
    const fetch = vi.fn().mockResolvedValue(reply(404, { error: { code: "NOT_FOUND", message: "Introuvable." } }));
    vi.stubGlobal("fetch", fetch);

    await expect(api("/gta/events/x")).rejects.toMatchObject({ status: 404, message: "Introuvable." });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
