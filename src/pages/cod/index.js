import { ClassicHub } from "../../components/cod/ClassicHub";
import { ModesHub } from "../../components/cod/ModesHub";
import { MATCH_TEAM_ENABLED } from "../../lib/config";

/** Hub COD : les trois sections (Classé, Division, Tournoi), ou le classé seul quand la Division est en pause. Public. */
export default function CodHubPage() {
  return MATCH_TEAM_ENABLED ? <ModesHub /> : <ClassicHub />;
}
