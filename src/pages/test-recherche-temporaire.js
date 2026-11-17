// Page de test locale, à supprimer : chiffres fictifs pour le panneau « En ce moment ».
if (typeof window !== "undefined" && !window.__activiteFausse) {
  window.__activiteFausse = true;
  const json = (data) => Promise.resolve(new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } }));
  const original = window.fetch;
  window.fetch = (url, options) => {
    if (String(url).includes("/cod/status"))
      return json({
        siteOnline: 14,
        matchesInProgress: 2,
        queues: [
          { format: "2v2", label: "2v2", teamSize: 2, size: 3, needed: 4 },
          { format: "3v3", label: "3v3", teamSize: 3, size: 0, needed: 6 },
          { format: "4v4", label: "4v4", teamSize: 4, size: 5, needed: 8 },
          { format: "5v5", label: "5v5", teamSize: 5, size: 1, needed: 10 },
        ],
      });
    if (String(url).includes("/teams/status")) return json({ teamsSearching: 1, matchesInProgress: 1 });
    if (String(url).includes("/teams/cups")) {
      const samedi = new Date();
      samedi.setDate(samedi.getDate() + ((6 - samedi.getDay() + 7) % 7 || 7));
      samedi.setHours(21, 0, 0, 0);
      return json({ upcoming: [{ id: "c1", kind: "horus", name: "Coupe Horus #4", status: "scheduled", startsAt: samedi.toISOString(), registered: 5, capacity: 8 }], past: [] });
    }
    return original(url, options);
  };
}

export default function TestActivite() {
  return <div className="min-h-screen" />;
}
