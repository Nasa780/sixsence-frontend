import Navigationaccueil from "../components/Navigationaccueil";
import Containeraccueil from "../components/Containeraccueil";

export default function Accueil() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#09090B] to-[#0E0E11]">
      <Navigationaccueil />
      <Containeraccueil />  
      {/* reste de ta page */}
    </div>
  );
}
