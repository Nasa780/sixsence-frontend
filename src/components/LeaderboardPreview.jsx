export default function LeaderboardPreview({ title, data }) {
  return (
    <div className="leaderboard-preview">
      <h3>{title}</h3>

      {data.length === 0 ? (
        <p>Aucun joueur classé</p>
      ) : (
        <ul>
          {data.map((p, i) => (
            <li key={i}>
              {i + 1}. {p.username} — {p.points} pts
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
