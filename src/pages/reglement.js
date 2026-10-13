import Link from "next/link";
import { LegalPage } from "../components/ui/LegalPage";
import { LEGAL } from "../lib/legal";
import { PLACEMENT_MATCHES, RANKS, STREAK_BONUSES, WIN_MAX, WIN_MIN, WIN_POINTS, WIN_XP } from "../lib/ranks";

const SECTIONS = [
  {
    id: "compte",
    title: "Compte et identité",
    content: (
      <ul>
        <li>Un seul compte Discord par joueur. Les comptes multiples (« smurfs ») sont interdits.</li>
        <li>
          L&apos;identifiant Activision renseigné doit être le tien et celui avec lequel tu joues le match. Un identifiant ne peut être
          lié qu&apos;à un seul compte SixSence.
        </li>
        <li>Pseudos, avatars et messages injurieux, haineux ou discriminatoires sont interdits.</li>
      </ul>
    ),
  },
  {
    id: "file",
    title: "File d'attente et « Prêt ? »",
    content: (
      <>
        <p>
          Quatre files sont ouvertes : <strong>2v2</strong>, <strong>3v3</strong>, <strong>4v4</strong> et <strong>5v5</strong>. On y joue seul ou
          en groupe, jusqu&apos;à la taille d&apos;une équipe (2 en 2v2, 3 en 3v3…). Un groupe
          est toujours placé dans la même équipe ; seul son chef lance la recherche, et si un membre quitte la file ou le site, la recherche
          du groupe est annulée.
        </p>
        <p>
          Quand assez de joueurs sont en file, les équipes sont formées et la carte est tirée au sort. Chaque joueur dispose alors de{" "}
          <strong>1 minute</strong> pour cliquer sur « Accepter le match ». Un son et une notification te préviennent.
        </p>
        <p>
          Sur ordinateur, garde la page ouverte pendant ta recherche : si tu la fermes, tu quittes la file au bout de 30 secondes. Sur
          téléphone, tu peux verrouiller l&apos;écran ou changer d&apos;appli : tu gardes ta place <strong>30 minutes</strong>. Active les
          notifications pour être prévenu du match trouvé ; si ta recherche s&apos;arrête, une notification te le dit aussi.
        </p>
        <p>
          Une recherche dure <strong>30 minutes</strong> au plus. 5 minutes avant la fin, le message « Toujours là ? » s&apos;affiche
          (et arrive en notification) : clique sur « Rester en file » pour repartir pour 30 minutes <strong>sans perdre ta place</strong>.
          Sans réponse, la recherche s&apos;arrête et tu peux la relancer quand tu veux. Dans un groupe, n&apos;importe quel membre peut
          répondre pour tout le groupe.
        </p>
        <p>
          Si un joueur n&apos;accepte pas à temps, le match est annulé. Ceux qui avaient accepté repartent{" "}
          <strong>en tête de file</strong> ; ceux qui n&apos;ont pas répondu reçoivent un avertissement.
        </p>
      </>
    ),
  },
  {
    id: "sanctions",
    title: "Sanctions",
    content: (
      <>
        <p>Les avertissements se comptent sur 24 heures glissantes :</p>
        <ul>
          <li>1er avertissement : aucun effet, simple rappel ;</li>
          <li>2e avertissement : 15 minutes sans accès à la file ;</li>
          <li>3e avertissement : 1 heure sans accès à la file ;</li>
          <li>au-delà : 24 heures sans accès à la file.</li>
        </ul>
        <p>
          Triche, logiciels tiers, arrangement de résultats, fausse déclaration de score ou abandon volontaire d&apos;un match lancé
          peuvent entraîner, après examen par l&apos;équipe, une remise à zéro des points ou une exclusion définitive.
        </p>
      </>
    ),
  },
  {
    id: "match",
    title: "Déroulement d'un match",
    content: (
      <ul>
        <li>
          Le classé se joue uniquement en <strong>Recherche &amp; Destruction Hardcore</strong> (réglage Hardcore de Call of Duty), dans
          toutes les files. Une partie jouée dans un autre mode ou sans le réglage Hardcore ne compte pas.
        </li>
        <li>
          Le premier joueur de l&apos;équipe 1 est l&apos;<strong>hôte</strong> : il crée la partie privée en Recherche &amp; Destruction
          Hardcore sur la carte tirée au sort, puis invite les autres joueurs grâce à leurs identifiants Activision affichés dans le salon
          de match.
        </li>
        <li>Les équipes tirées au sort doivent être respectées ; aucun remplaçant n&apos;est autorisé.</li>
        <li>Le chat du salon et, s&apos;il est actif, le salon vocal Discord servent à s&apos;organiser.</li>
      </ul>
    ),
  },
  {
    id: "resultat",
    title: "Résultat et contestation",
    content: (
      <>
        <ul>
          <li>À la fin de la partie, n&apos;importe quel joueur déclare l&apos;équipe gagnante.</li>
          <li>
            L&apos;équipe adverse confirme ou conteste. Sans réponse sous 15 minutes, le résultat déclaré est validé
            automatiquement.
          </li>
          <li>Un match jamais déclaré est annulé au bout de 3 heures, sans changement de points.</li>
          <li>
            En cas de contestation, ajoute une <strong>capture du tableau des scores</strong> dans le salon de match : un
            administrateur tranche (victoire d&apos;une équipe ou annulation). Sa décision est définitive.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "mvp",
    title: "MVP",
    content: (
      <ul>
        <li>
          Après un match terminé, chaque joueur (gagnant ou perdant) a <strong>24 heures</strong> pour élire le meilleur joueur de
          l&apos;<strong>équipe gagnante</strong>.
        </li>
        <li>Si tu as gagné, tu peux voter pour toi-même.</li>
        <li>Tu peux changer ton vote tant que les 24 heures ne sont pas écoulées.</li>
        <li>
          Le plus élu est MVP du match. À égalité, les votes reçus des autres joueurs départagent ; si l&apos;égalité persiste, les joueurs
          sont co-MVP.
        </li>
        <li>Le joueur le plus élu du mois reçoit le badge « MVP du mois » sur son profil.</li>
      </ul>
    ),
  },
  {
    id: "points",
    title: "Points et rangs",
    content: (
      <>
        <p>
          Les points dépendent du <strong>niveau de l&apos;équipe adverse</strong> (moyenne des points de ses joueurs, comparée à celle de
          ton équipe). Contre une équipe de même niveau, une victoire rapporte <strong>+{WIN_POINTS} points</strong> ; contre plus fort,
          jusqu&apos;à <strong>+{WIN_MAX}</strong> ; contre plus faible, au moins <strong>+{WIN_MIN}</strong>. Chaque victoire rapporte
          aussi +{WIN_XP} XP.
        </p>
        <p>
          Une défaite coûte la pénalité de ton rang (ci-dessous) : un peu moins contre plus fort, un peu plus contre plus faible.{" "}
          <strong>Seul</strong>, tu perds 25 % de points en moins. Tu ne descends jamais en dessous de 0.
        </p>
        <p>
          <strong>Placement</strong> : tes {PLACEMENT_MATCHES} premiers matchs de la saison comptent double, pour atteindre vite ton vrai
          niveau. <strong>Série</strong> :{" "}
          {STREAK_BONUSES.map((step, index) => (
            <span key={step.streak}>
              {index > 0 ? ", " : ""}
              {step.streak}e victoire d&apos;affilée +{step.bonus}
              {index === STREAK_BONUSES.length - 1 ? " (et suivantes)" : ""}
            </span>
          ))}
          .
        </p>
        <p>Les points en jeu (victoire et défaite) s&apos;affichent avant chaque match, dans la fenêtre « Match trouvé » et le salon.</p>
        <ul>
          {[...RANKS].reverse().map((rank) => (
            <li key={rank.name}>
              <strong>{rank.name}</strong> : à partir de {rank.min} points, défaite -{rank.loss} contre une équipe de même niveau
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "saisons",
    title: "Saisons",
    content: (
      <p>
        À la fin de chaque saison, le classement final est archivé (consultable sur la page{" "}
        <Link href="/cod/leaderboard">Classement</Link>). Le premier reçoit le badge <strong>Champion</strong>, les dix premiers le
        badge <strong>Top 10</strong>. Points, victoires et défaites repartent ensuite de zéro ; l&apos;XP et les niveaux sont
        conservés.
      </p>
    ),
  },
  {
    id: "evenements",
    title: "Événements GTA 6",
    content: (
      <p>
        L&apos;inscription à un événement engage à y participer. En cas d&apos;empêchement, désinscris-toi depuis la page de
        l&apos;événement pour libérer ta place.
      </p>
    ),
  },
];

/** Règlement de la plateforme : file, sanctions, matchs, points. */
export default function RulesPage() {
  return (
    <LegalPage
      eyebrow="Fair-play"
      title="Règlement"
      description="Les règles du classé SixSence : file d'attente, sanctions, déroulement des matchs, points et saisons."
      updated={LEGAL.updated}
      sections={SECTIONS}
    />
  );
}
