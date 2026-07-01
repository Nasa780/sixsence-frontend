import Header from "../components/Header";
import MainContent from "../components/MainContent";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <Header />
      <MainContent />
    </div>
  );
}
