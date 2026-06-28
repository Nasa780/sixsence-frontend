import React, { useEffect, useState } from "react";
import { getToken } from "../../utils/auth";
import { useRouter } from "next/router";
import RankedModeCard from "../components/RankedModeCard";
import LeaderboardPreview from "../components/LeaderboardPreview";

export default function RankedHub() {
  const router = useRouter();
  const [topPlayers, setTopPlayers] = useState([]);
  const [topTeams, setTopTeams] = useState([]);

  useEffect(() => {
    const token = getToken();
    console.log("TOKEN =", token); // ← ajoute ça
    if (!token) return router.push("/");

    fetch("https://sixsence-backend.onrender.com/leaderboard/top10", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTopPlayers(data.players || []);
        setTopTeams(data.teams || []);
      });
  }, []);

  return (
    <div className="ranked-hub">
      <h1 className="title">Mode Classé</h1>

      <div className="modes-container">
        <RankedModeCard
          title="MODE CLASSÉ"
          description="Solo 4v4 & 5v5 - Affronte les meilleurs joueurs !"
          button="Jouer"
          onClick={() => router.push("/queue")}
          color="red"
        />

        <RankedModeCard
          title="MODE STRICKER"
          description="L’élite contre l’élite - Ranked 3v3 & 5v5 en équipe !"
          button="Bientôt"
          disabled={true}
          color="green"
        />
      </div>

      <div className="leaderboards">
        <LeaderboardPreview title="TOP 10 JOUEURS" data={topPlayers} />
        <LeaderboardPreview title="TOP 10 ESQUADES" data={topTeams} />
      </div>
    </div>
  );
}
