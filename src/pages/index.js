import Header from "../components/Header";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#07070D",
        color: "white",
      }}
    >
      <Header />

      {/* Tu pourras ajouter MainContent ici ensuite */}
      <div style={{ padding: "40px", fontSize: "20px" }}>
        <p>La page fonctionne. Le Header est affiché.</p>
      </div>
    </div>
  );
}
