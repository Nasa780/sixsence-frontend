import Header from "../components/Header";
import MainContent from "../components/MainContent";
import Container from "../components/Container";

export default function Home() {
  return (
    <div
      className="w-full min-h-screen text-white flex flex-col relative"
style={{
  backgroundImage: "url('/assets/Background.png')",
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
}}
    >
      {/* Header en haut */}
      <Header />

      {/* Bloc central parfaitement centré */}
      <div className="flex-1 flex items-center justify-center">
        <MainContent />
      </div>

      {/* Card APPLICATION WINDOWS en bas à gauche */}
      <div className="absolute bottom-8 left-8">
        <Container />
      </div>
    </div>
  );
}
