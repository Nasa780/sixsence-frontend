import { AutoReady } from "../components/cod/QueuePanel";
import { Container } from "../components/ui/Container";

// Démo (non commitée) : option « Prêt automatique » (profil simulé par la capture).
export default function DevAutoReady() {
  return (
    <Container className="space-y-6 pb-16 pt-28">
      <AutoReady userId="00000000-0000-0000-0000-00000000000a" />
    </Container>
  );
}
