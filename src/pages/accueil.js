import Navigationaccueil from "../components/Navigationaccueil";
import Containeraccueil from "../components/Containeraccueil";
import Containeraccueil2 from "../components/Containeraccueil2";
import Sectionaccueil from "../components/Sectionaccueil";
import Appaccueil from "../components/Appaccueil";
import Sectionaccueil2 from "../components/Sectionaccueil2";
import Containermarginaccueil from "../components/Containermarginaccueil";  

export default function Accueil() {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* BACKGROUND */}
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

      {/* CONTENU CENTRÉ */}
      <div className="w-full flex flex-col items-center justify-center">

        <Navigationaccueil />
        <Containeraccueil />
        <Containeraccueil2 />
        <Sectionaccueil />
        <Appaccueil />
        <Sectionaccueil2/>
        <Containermarginaccueil />  
      </div>
    </div>
  );
}
