import Navigationaccueil from "../components/Navigationaccueil";
import Containeraccueil from "../components/Containeraccueil";

export default function Accueil() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(145deg, #06070F 6.17%, #080B14 36.85%, #0A0C10 63.15%, #07080C 93.83%),
          url('/assets/GeometricBg.png')
        `,
      }}
    >
      <Navigationaccueil />
      <Containeraccueil />  
      {/* reste de ta page */}
    </div>
  );
}
