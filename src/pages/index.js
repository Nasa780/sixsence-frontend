import Header from "../components/Header";
import MainContent from "../components/MainContent";
import Container from "../components/Container";

export default function Home() {
  return (
    <div
      className="w-full min-h-screen text-white relative"
      style={{
        backgroundImage: "url('/assets/Background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
      <Header />

      {/* Bloc central parfaitement centré */}
      <div className="flex justify-center items-center w-full">
        <MainContent />
      </div>

      {/* Card APPLICATION WINDOWS — position Figma */}
      <div className="absolute bottom-8 left-8">
        <Container />
      </div>
    </div>
  );
}
