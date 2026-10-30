import { HubActions } from "../components/cod/HubActions";
import { PageHeader } from "../components/ui/Typography";

// Démo (non commitée) : boutons de l'en-tête MW4 avec un joueur d'exemple (réponses simulées par la capture).
export default function DevHubAction() {
  return (
    <PageHeader
      image="/images/mw4.webp"
      eyebrow="Call of Duty"
      title={
        <>
          Zone de <span className="text-gold-gradient">combat</span>
        </>
      }
      description="Content de te revoir, nqsq. Classé, Division et Tournoi t'attendent."
      actions={<HubActions user={{ id: "u-demo", username: "nqsq" }} />}
    />
  );
}
