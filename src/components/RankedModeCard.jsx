export default function RankedModeCard({ title, description, button, onClick, disabled, color }) {
  return (
    <div className={`ranked-card ${color}`}>
      <h2>{title}</h2>
      <p>{description}</p>
      <button disabled={disabled} onClick={onClick}>
        {button}
      </button>
    </div>
  );
}
