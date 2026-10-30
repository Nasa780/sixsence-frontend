import { useState } from "react";
import { MatchResultOverlay } from "../components/cod/MatchResultOverlay";

// Page de démonstration (jamais commitée) : écran de fin de match.
export default function DevResultat() {
  const [show, setShow] = useState(null);
  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-40 text-center">
      <button type="button" className="mx-2 bg-win px-6 py-3 font-bold text-ink" onClick={() => setShow({ won: true, n: Date.now() })}>Voir Victoire</button>
      <button type="button" className="mx-2 bg-loss px-6 py-3 font-bold text-ink" onClick={() => setShow({ won: false, n: Date.now() })}>Voir Défaite</button>
      {show ? (
        <MatchResultOverlay key={show.n} demo matchId="demo" won={show.won} delta={show.won ? 52 : -27} points={show.won ? 1287 : 1208} map="Mumbai" onDone={() => setShow(null)} />
      ) : null}
    </div>
  );
}
