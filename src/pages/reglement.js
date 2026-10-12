import Link from "next/link";
import { LegalPage } from "../components/ui/LegalPage";
import { LEGAL } from "../lib/legal";
import { GROUP_WIN_POINTS, RANKS, WIN_POINTS, WIN_XP } from "../lib/ranks";

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
          Deux files sont ouvertes : <strong>2v2</strong> (seul ou en duo) et <strong>5v5</strong> (seul ou en groupe de 2 à 5). Un groupe
          est toujours placé dans la même équipe ; seul son chef lance la recherche, et si un membre quitte la file ou le site, la recherche
          du groupe est annulée.
        </p>
        <p>
          Quand assez de joueurs sont en file, les équipes sont formées et la carte est tirée au sort. Chaque joueur dispose alors de{" "}
          <strong>1 minute</strong> pour cliquer sur « Accepter le match ». Un son et une notification te préviennent : garde la page
          ouverte pendant ta recherche.
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
          Le premier joueur de l&apos;équipe 1 est l&apos;<strong>hôte</strong> : il crée la partie privée avec la carte et le mode
          tirés au sort, puis invite les autres joueurs grâce à leurs identifiants Activision affichés dans le salon de match.
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
    id: "points",
    title: "Points et rangs",
    content: (
      <>
        <p>
          Victoire : <strong>+{WIN_POINTS} points</strong> et +{WIN_XP} XP. Défaite : de -{Math.min(...RANKS.map((rank) => rank.loss))} à
          -{Math.max(...RANKS.map((rank) => rank.loss))} points selon ton rang (jamais en dessous de 0).
        </p>
        <p>
          La taille de ton groupe compte : <strong>seul</strong>, une défaite coûte 25 % de points en moins ;{" "}
          <strong>en groupe de 3 joueurs ou plus</strong>, une victoire rapporte {GROUP_WIN_POINTS} points au lieu de {WIN_POINTS} (jouer ensemble
          est un avantage).
        </p>
        <ul>
          {[...RANKS].reverse().map((rank) => (
            <li key={rank.name}>
              <strong>{rank.name}</strong> : à partir de {rank.min} points, défaite -{rank.loss}
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
