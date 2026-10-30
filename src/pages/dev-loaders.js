import { useRouter } from "next/router";
import { useEffect } from "react";
import { Container } from "../components/ui/Container";
import { Loading } from "../components/ui/Feedback";

// Aperçu (non commité) : Loading dans chaque univers ; ?plein=1 simule un changement de page lent.
export default function DevLoaders() {
  const router = useRouter();
  useEffect(() => {
    if (router.query.plein) setTimeout(() => router.events.emit("routeChangeStart", "/simulation", { shallow: false }), 300);
  }, [router]);
  return (
    <Container className="grid gap-4 pb-16 pt-28 sm:grid-cols-2">
      {[undefined, "classe", "division", "tournoi"].map((u) => (
        <div key={u ?? "or"} data-univers={u} className="border border-white/10">
          <Loading label={u ? `Chargement ${u}` : "Chargement du classement"} />
        </div>
      ))}
    </Container>
  );
}
