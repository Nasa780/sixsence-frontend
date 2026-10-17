import { ClassicHub } from "../../components/cod/ClassicHub";
import { ModesHub } from "../../components/cod/ModesHub";
import { MATCH_TEAM_ENABLED } from "../../lib/config";

/** Hub COD : les deux modes (classé, match team), ou le classé seul quand le mode Match team est en pause. Public. */
export default function CodHubPage() {
  return MATCH_TEAM_ENABLED ? <ModesHub /> : <ClassicHub />;
}
