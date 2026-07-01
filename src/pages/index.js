import Header from "../components/Header";
import MainContent from "../components/MainContent";

export default function Home() {
  return (
    <div
      className="w-full min-h-screen text-white"
      style={{
        backgroundImage: "url('/assets/Background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header />
      <MainContent />
    </div>
  );
}
