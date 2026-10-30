import { ReadyCheckOverlay } from "../components/cod/QueuePanel";

// Page de démonstration locale (jamais committée) : plein écran « Match trouvé » avec la map en fond.
export default function DevPret() {
  const deadline = new Date(Date.now() + 47000).toISOString();
  return (
    <div className="min-h-screen">
      <ReadyCheckOverlay
        userId="moi"
        started={false}
        check={{ matchId: "demo", format: "3v3", map: "Rooftops", mode: "R&D Hardcore", deadline, total: 6, accepted: 2, readyUsers: ["a", "b"], points: null }}
      />
    </div>
  );
}
