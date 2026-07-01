import Header from "../components/Header";
import MainContent from "../components/MainContent";
import Container from "../components/Container";

export default function Home() {
  return (
    <div
      className="relative w-full min-h-screen text-white overflow-hidden"
      style={{
        backgroundImage: "url('/assets/Background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
      <Header />

      {/* Bloc central parfaitement centré */}
      <div className="flex justify-center items-center w-full pt-[80px]">
        <MainContent />
      </div>

      {/* Card APPLICATION WINDOWS — position Figma */}
      <div className="absolute bottom-[40px] left-[40px]">
        <Container />
      </div>
    </div>
  );
}
