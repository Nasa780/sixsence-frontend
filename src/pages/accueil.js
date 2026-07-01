import Navigationaccueil from "../components/Navigationaccueil";
import Containeraccueil from "../components/Containeraccueil";
import Sectionaccueil from "../components/Sectionaccueil";
import Appaccueil from "../components/Appaccueil";
import Containeraccueil2 from "../components/Containeraccueil2";

export default function Accueil() {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* BACKGROUND DÉGRADÉ */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            "linear-gradient(145deg, #06070F 6.17%, #080B14 36.85%, #0A0C10 63.15%, #07080C 93.83%)"
        }}
      />

      {/* FORME GÉOMÉTRIQUE */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <img
          src="/assets/GeometricBg.png"
          alt=""
          className="w-full h-full object-cover opacity-[0.45]"
        />
      </div>
      
      <Navigationaccueil />
      <Containeraccueil />  
      <Sectionaccueil />  
      <Appaccueil />  
      <Containeraccueil2 />  
      {/* reste de ta page */}
    </div>
  );
}
