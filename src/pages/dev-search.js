import { useEffect, useState } from "react";

const MOCK = {
  players: [
    { id: "p1", username: "Noxira", avatarUrl: null, points: 1840, position: 4, team: { tag: "SIX", color: "#d4af37" } },
    { id: "p2", username: "Noxx_FR", avatarUrl: null, points: 720, position: 31, team: null },
  ],
  teams: [{ id: "t1", name: "Nexora", tag: "NXR", color: "#8c6cf0", logoUrl: null, points: 1210, position: 2, size: 6 }],
};

export default function DevSearch() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const original = window.fetch;
    window.fetch = (url, init) =>
      String(url).includes("/search?") ? Promise.resolve(new Response(JSON.stringify(MOCK), { headers: { "Content-Type": "application/json" } })) : original(url, init);
    setReady(true);
    const query = new URLSearchParams(window.location.search).get("q");
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
      if (query)
        setTimeout(() => {
          const input = document.querySelector('input[aria-label^="Rechercher"]');
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, query);
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }, 400);
    }, 800);
  }, []);
  return ready ? (
    <div className="min-h-screen pt-28" />
  ) : null;
}
