import Link from "next/link";
import { LegalPage } from "../components/ui/LegalPage";
import { MATCH_TEAM_ENABLED } from "../lib/config";
import { LOSS_ADJUST, LOSS_XP, PLACEMENT_MATCHES, RANKS, WIN_POINTS, WIN_POINTS_MAX, WIN_POINTS_MIN, WIN_XP } from "../lib/ranks";

/** Règles de la Division (matchs d'équipe) et du tournoi : affichées quand le mode est ouvert. */
function DIVISION_SECTIONS() {
  return [
    {
      id: "division-equipes",
      group: "Division",
      title: "Équipes",
      content: (
        <ul>
          <li>
            Une équipe compte jusqu&apos;à <strong>8 joueurs</strong>. Pour créer ou rejoindre une équipe, il faut un compte Discord lié, un
            identifiant Activision renseigné et aucune exclusion en cours. On ne fait partie que d&apos;une équipe à la fois.
          </li>
          <li>
            Le créateur porte la <strong>couronne</strong> : il nomme les Leaders, renomme l&apos;équipe, la transmet ou la dissout. Les
            Leaders invitent, acceptent les candidatures, lancent les matchs et peuvent exclure des joueurs.
          </li>
          <li>Après avoir quitté une équipe, il faut attendre 24 heures avant d&apos;en rejoindre une autre.</li>
          <li>
            <strong>Transferts verrouillés</strong> pendant la dernière semaine de la saison et pendant le tournoi : aucune arrivée, aucun
            départ, aucune exclusion ni dissolution.
          </li>
          <li>Noms, tags, logos et bannières injurieux ou trompeurs sont interdits et peuvent être retirés par l&apos;équipe SixSence.</li>
        </ul>
      ),
    },
    {
      id: "division-recherche",
      group: "Division",
      title: "Recherche d'un match",
      content: (
        <ul>
          <li>
            Seul un <strong>Leader</strong> lance la recherche. Il choisit dans l&apos;effectif les <strong>4 joueurs du match</strong> (il
            n&apos;y a ni titulaires ni remplaçants) ; chacun doit avoir son identifiant Activision et ne pas être dans la file ou un match
            classé.
          </li>
          <li>L&apos;adversaire reste anonyme jusqu&apos;au match : impossible de choisir contre qui l&apos;on joue.</li>
          <li>Deux équipes ne peuvent pas se rencontrer à nouveau moins de <strong>2 heures</strong> après leur dernier match.</li>
          <li>
            Une recherche dure <strong>30 minutes</strong> au plus. 5 minutes avant la fin, « Toujours là ? » s&apos;affiche : un Leader ou un
            joueur inscrit clique sur « Continuer » pour repartir pour 30 minutes, sinon la recherche s&apos;arrête. Un son et une notification
            préviennent quand le match est trouvé ou la recherche arrêtée.
          </li>
          <li>Changer l&apos;effectif pendant une recherche retire l&apos;équipe de la file.</li>
        </ul>
      ),
    },
    {
      id: "division-match",
      group: "Division",
      title: "Déroulement d'un match",
      content: (
        <ul>
          <li>
            Le match se joue en <strong>BO3</strong> (Recherche &amp; Destruction Hardcore), 6 manches gagnantes par map. Les 3 maps sont
            tirées au sort à la création du match et affichées tout de suite ; la map 3 n&apos;est jouée qu&apos;à 1-1.
          </li>
          <li>
            Une <strong>équipe hôte</strong> est tirée au sort. Elle crée la partie privée et donne son code dans le champ « Code de la partie » de la feuille de match (modifiable en cas d&apos;erreur) dans les{" "}
            <strong>10 minutes</strong>.
          </li>
          <li>
            Les deux équipes ont <strong>15 minutes</strong> après la création du match pour lancer la partie.
          </li>
          <li>
            <strong>Déconnexion</strong> : l&apos;équipe du joueur déconnecté peut demander à arrêter la partie, <strong>une seule fois</strong> par
            match. La demande se fait en fin de manche ou dans les premières secondes d&apos;une manche, jamais en cours de manche (après un
            kill, une bombe posée ou toute autre action). La partie reprend au même score dans les <strong>5 minutes</strong>, même si le joueur
          n&apos;a pas réussi à se reconnecter.
          </li>
          <li>Le chat du match est réservé aux joueurs du match, aux Leaders des deux équipes et aux arbitres.</li>
        </ul>
      ),
    },
    {
      id: "division-forfait",
      group: "Division",
      title: "Forfait",
      content: (
        <ul>
          <li>
            Si l&apos;équipe hôte n&apos;a pas donné le code de la partie au bout de 10 minutes, ou si une équipe ne s&apos;est pas présentée dans la partie au
            bout de 15 minutes, l&apos;autre équipe peut <strong>déclarer forfait</strong>.
          </li>
          <li>
            L&apos;équipe visée a <strong>15 minutes</strong> pour valider (défaite par forfait) ou contester. Sans réponse, ou en cas de
            contestation, un arbitre SixSence tranche.
          </li>
          <li>Une victoire par forfait compte comme une victoire normale (points d&apos;équipe et XP).</li>
          <li>
            Une équipe qui perd <strong>4 matchs par forfait en 7 jours</strong> ne peut plus lancer de recherche pendant{" "}
            <strong>24 heures</strong>. Il n&apos;y a pas d&apos;autre sanction.
          </li>
        </ul>
      ),
    },
    {
      id: "division-resultat",
      group: "Division",
      title: "Scores, points et contestation",
      content: (
        <ul>
          <li>
            À la fin de la série, un <strong>joueur du match</strong> ou un Leader déclare <strong>en une seule fois</strong> le score de chaque
            map jouée. L&apos;équipe adverse confirme ou conteste une seule fois ; sans réponse sous 15 minutes, les scores sont validés automatiquement.
          </li>
          <li>
            En cas de contestation, ajoute une capture du tableau des scores sur la feuille de match (5 par joueur du match) : un arbitre
            tranche. Un match sans résultat au bout de 3 heures est annulé.
          </li>
          <li>
            <strong>Points d&apos;équipe</strong> : +20 à +30 en victoire, -20 à -30 en défaite selon le niveau de l&apos;adversaire (+25 / -25 à
            niveau égal). Ce que gagne une équipe, l&apos;autre le perd. Chaque équipe démarre la saison à 1 000 points.
          </li>
          <li>
            <strong>XP</strong> : comme en classé, +{WIN_XP} XP par victoire et +{LOSS_XP} XP par défaite, pour les joueurs du match
            seulement. Les points du classé ne changent pas.
          </li>
        </ul>
      ),
    },
    {
      id: "tournoi",
      group: "Tournoi",
      title: "Tournoi de fin de saison",
      content: (
        <ul>
          <li>
            Sont qualifiées les meilleures équipes du classement de la Division ayant joué au moins <strong>25 matchs</strong>, dans la limite des
            places du tournoi (8, 16 ou 32, annoncées à sa création). Leur effectif est figé jusqu&apos;à la fin du tournoi.
          </li>
          <li>
            Un Leader fait le <strong>check-in</strong> entre 2 h et 15 minutes avant le début et choisit les joueurs parmi l&apos;effectif
            inscrit ; sans check-in, l&apos;équipe est déclarée forfait.
          </li>
          <li>
            Les matchs suivent le même déroulé que la Division (hôte, chat, forfait) : BO3, finale en BO5, sans points
            d&apos;équipe en jeu.
          </li>
          <li>Le vainqueur reçoit un trophée sur sa fiche d&apos;équipe et un rôle Discord.</li>
        </ul>
      ),
    },
    {
      id: "defis-ligues",
      group: "Division",
      title: "Défis directs et ligues",
      content: (
        <ul>
          <li>
            Un Leader peut <strong>défier</strong> une autre équipe depuis sa fiche : BO3 <strong>amical</strong> (aucun point, aucun bilan) ou
            <strong> officiel</strong> (points de Division normaux), maintenant ou à une heure fixée (jusqu&apos;à 7 jours). Mêmes règles que les
            matchs de la Division ; sans réponse, le défi expire après 24 h.
          </li>
          <li>
            Dès 16 équipes, la Division se joue en <strong>ligues</strong> : Élite (8 équipes), Ligue 1 (8 équipes) et Ligue 2. À chaque fin de
            saison, les 2 premières de Ligue 1 et de Ligue 2 montent, les 2 dernières d&apos;Élite et de Ligue 1 descendent ; une nouvelle équipe
            commence en Ligue 2.
          </li>
          <li>
            Le <strong>score de fiabilité</strong> (sur 100, sur le profil) baisse avec les « Prêt ? » manqués, les forfaits et les résultats
            corrigés, et remonte avec chaque match joué jusqu&apos;au bout. Il est indicatif.
          </li>
        </ul>
      ),
    },
    {
      id: "coupe-horus",
      group: "Tournoi",
      title: "Coupe Horus (équipes)",
      content: (
        <ul>
          <li>
            Un Leader <strong>inscrit son équipe</strong> dès l&apos;ouverture de la coupe et peut la désinscrire jusqu&apos;au check-in. Places
            limitées (4, 8 ou 16 équipes).
          </li>
          <li>
            Check-in d&apos;un Leader entre <strong>2 h et 15 minutes</strong> avant le début. Moins de 4 équipes présentes : coupe annulée. Le
            tableau est tiré au sort et dévoilé 15 minutes avant les premiers matchs.
          </li>
          <li>
            Matchs en BO1 ou BO3, finale en BO3 ou BO5, même déroulé que la Division. Élimination directe avec petite finale, ou double
            élimination (une 2e défaite élimine, grande finale en un seul match).
          </li>
          <li>
            Récompenses : trophée or, argent ou bronze sur la fiche d&apos;équipe, <strong>+150 / +100 / +75 points</strong> de Division
            pour le podium et +50 pour les autres équipes présentes ; rôle Discord du vainqueur gardé jusqu&apos;à la coupe suivante.
          </li>
        </ul>
      ),
    },
    {
      id: "coupe-anubis",
      group: "Tournoi",
      title: "Coupe Anubis (solo)",
      content: (
        <ul>
          <li>
            Chaque joueur <strong>s&apos;inscrit seul</strong> (identifiant Activision requis, sans exclusion en cours) et peut se
            désinscrire jusqu&apos;au début.
          </li>
          <li>
            Check-in individuel entre <strong>2 h et 15 minutes</strong> avant le début : seuls les joueurs présents sont répartis, et les équipes sont dévoilées 15 minutes avant les premiers matchs.
          </li>
          <li>
            Les équipes sont <strong>tirées au sort</strong> à la taille annoncée (2, 3 ou 4 joueurs). Le joueur le mieux classé de chaque
            équipe est capitaine ; les joueurs en trop deviennent remplaçants (un par équipe au plus), le capitaine peut les faire entrer
            entre deux matchs. Moins de 4 équipes complètes : coupe annulée.
          </li>
          <li>Même format et même déroulé que la Coupe Horus ; aucun point d&apos;équipe en jeu.</li>
          <li>
            Récompenses : <strong>médaille</strong> or, argent ou bronze sur le profil de chaque joueur du podium (remplaçants compris) et
            rôle Discord du vainqueur gardé jusqu&apos;à la Coupe Anubis suivante.
          </li>
        </ul>
      ),
    },
  ];
}

const SECTIONS = [
  {
    id: "compte",
    group: "Général",
    title: "Compte et identité",
    content: (
      <ul>
        <li>Un seul compte par joueur : les comptes multiples (« smurfs ») sont interdits.</li>
        <li>
          L&apos;identifiant Activision renseigné doit être le tien, celui avec lequel tu joues tes matchs. Un identifiant ne peut être lié
          qu&apos;à un seul compte SixSence.
        </li>
        <li>Pseudos, avatars, noms d&apos;équipe et messages injurieux, haineux ou discriminatoires sont interdits.</li>
      </ul>
    ),
  },
  {
    id: "comportement",
    group: "Général",
    title: "Comportement et triche",
    content: (
      <>
        <p>Ces règles valent partout : classé, Division, tournoi et événements.</p>
        <ul>
          <li>Triche et logiciels tiers interdits.</li>
          <li>Pas d&apos;arrangement de résultat ni de fausse déclaration de score.</li>
          <li>Pas d&apos;abandon volontaire d&apos;un match lancé.</li>
          <li>Respect dans les chats de match et sur le Discord : pas d&apos;insultes ni de provocations.</li>
          <li>Le code d&apos;une partie privée est confidentiel : ne le partage pas en dehors du match.</li>
        </ul>
        <p>
          Après examen, l&apos;équipe SixSence peut donner un avertissement, une exclusion temporaire ou définitive, ou retirer des points.
          Tu es prévenu en message privé Discord.
        </p>
      </>
    ),
  },
  {
    id: "saisons",
    group: "Général",
    title: "Saisons",
    content: (
      <>
        <p>À la fin de chaque saison, les classements finaux sont archivés, puis tout repart à zéro :</p>
        <ul>
          <li>
            <strong>Classé</strong> : le premier reçoit le badge <strong>Champion</strong>, les dix premiers le badge <strong>Top 10</strong>.
            Points, victoires et défaites repartent de zéro ; l&apos;XP et les niveaux sont conservés.
          </li>
          <li>
            <strong>Division</strong> : le classement des équipes est archivé, chaque équipe repart à <strong>1 000 points</strong> avec un
            bilan à zéro.
          </li>
        </ul>
        <p>
          Les classements des saisons passées restent consultables sur la page <Link href="/cod/leaderboard">Classement</Link>.
        </p>
      </>
    ),
  },
  {
    id: "file",
    group: "Classé",
    title: "File d'attente et « Prêt ? »",
    content: (
      <>
        <p>
          Quatre files : <strong>2v2</strong>, <strong>3v3</strong>, <strong>4v4</strong> et <strong>5v5</strong>. Le classé se joue
          <strong> en solo</strong> : chacun rejoint la file seul.
        </p>
        <p>
          Quand assez de joueurs attendent, les premiers arrivés sont retenus, puis les équipes et la carte sont tirées au sort. Tu as alors{" "}
          <strong>1 minute</strong> pour cliquer sur « Accepter le match » (un son et une notification te préviennent).
        </p>
        <p>
          Une recherche dure <strong>30 minutes</strong>, même si tu fermes la page ou verrouilles ton téléphone. 5 minutes avant la fin,
          « Toujours là ? » : clique sur « Rester en file » pour repartir pour 30 minutes <strong>sans perdre ta place</strong>.
        </p>
        <p>
          Si un joueur n&apos;accepte pas à temps, le match est annulé : ceux qui avaient accepté repartent <strong>en tête de file</strong>,
          ceux qui n&apos;ont pas répondu reçoivent un avertissement.
        </p>
      </>
    ),
  },
  {
    id: "avertissements",
    group: "Classé",
    title: "Avertissements de la file",
    content: (
      <>
        <p>
          Un match non accepté à temps donne un avertissement. Ils se comptent sur <strong>24 heures glissantes</strong> :
        </p>
        <ul>
          <li>1er avertissement : simple rappel, aucun effet ;</li>
          <li>2e : 15 minutes sans accès à la file ;</li>
          <li>3e : 1 heure sans accès à la file ;</li>
          <li>au-delà : 24 heures sans accès à la file.</li>
        </ul>
      </>
    ),
  },
  {
    id: "match",
    group: "Classé",
    title: "Déroulement d'un match",
    content: (
      <ul>
        <li>
          Uniquement en <strong>Recherche &amp; Destruction Hardcore</strong>. Une partie jouée dans un autre mode ou sans le réglage
          Hardcore ne compte pas.
        </li>
        <li>
          L&apos;<strong>hôte</strong> est tiré au sort et indiqué dans le salon de match : il crée la partie privée sur la carte tirée au
          sort et invite les autres joueurs grâce aux identifiants Activision affichés dans le salon.
        </li>
        <li>Les équipes tirées au sort doivent être respectées : personne ne prend la place d&apos;un joueur du match.</li>
        <li>
          <strong>Déconnexion</strong> : l&apos;équipe du joueur déconnecté peut demander à arrêter la partie, <strong>une seule fois</strong> par
          match. La demande se fait en fin de manche ou dans les premières secondes d&apos;une manche, jamais en cours de manche (après un
          kill, une bombe posée ou toute autre action). La partie reprend au même score dans les <strong>5 minutes</strong>, même si le joueur
          n&apos;a pas réussi à se reconnecter.
        </li>
        <li>Le chat du salon et, s&apos;il est actif, le salon vocal Discord servent à s&apos;organiser.</li>
      </ul>
    ),
  },
  {
    id: "resultat",
    group: "Classé",
    title: "Résultat et contestation",
    content: (
      <ul>
        <li>À la fin de la partie, n&apos;importe quel joueur du match déclare l&apos;équipe gagnante.</li>
        <li>L&apos;équipe adverse confirme ou conteste. Sans réponse sous 15 minutes, le résultat est validé automatiquement.</li>
        <li>
          En cas de contestation, ajoute une <strong>capture du tableau des scores</strong> dans le salon : un arbitre SixSence tranche
          (victoire d&apos;une équipe ou annulation). Sa décision est définitive.
        </li>
        <li>
          Erreur de déclaration (mauvais clic) : tu peux demander une <strong>correction</strong> depuis le salon pendant 24 heures après
          la validation.
        </li>
        <li>Un match jamais déclaré est annulé au bout de 3 heures, sans changement de points.</li>
      </ul>
    ),
  },
  {
    id: "mvp",
    group: "Classé",
    title: "MVP",
    content: (
      <ul>
        <li>
          Après un match terminé, chaque joueur (gagnant ou perdant) a <strong>24 heures</strong> pour élire le meilleur joueur de
          l&apos;<strong>équipe gagnante</strong>.
        </li>
        <li>Si tu as gagné, tu peux voter pour toi-même.</li>
        <li>Tu peux changer ton vote tant que les 24 heures ne sont pas écoulées.</li>
        <li>
          Le plus élu est MVP du match. À égalité, les votes reçus des autres joueurs départagent ; si l&apos;égalité persiste, les joueurs
          sont co-MVP.
        </li>
        <li>Le joueur le plus élu du mois reçoit le badge « MVP du mois » sur son profil.</li>
      </ul>
    ),
  },
  {
    id: "points",
    group: "Classé",
    title: "Points et rangs",
    content: (
      <>
        <p>
          <strong>
            Victoire : +{WIN_POINTS_MIN} à +{WIN_POINTS_MAX} points
          </strong>{" "}
          (et +{WIN_XP} XP), selon le niveau des deux équipes : on additionne les points de tous les joueurs de chaque équipe. À niveau égal,
          c&apos;est +{WIN_POINTS} ; battre une équipe plus forte rapporte plus (jusqu&apos;à +{WIN_POINTS_MAX}), une équipe plus faible moins (jusqu&apos;à
          +{WIN_POINTS_MIN}). Toute l&apos;équipe gagne la même chose.
        </p>
        <p>
          <strong>Défaite</strong> : plus tu montes, plus elle coûte cher (détail par rang ci-dessous), puis la perte est ajustée selon l&apos;équipe
          adverse : jusqu&apos;à {LOSS_ADJUST} % de moins contre une équipe plus forte, jusqu&apos;à {LOSS_ADJUST} % de plus contre une équipe plus faible.{" "}
          Tu ne descends jamais en dessous de 0. Tu gagnes quand même +{LOSS_XP} XP.
        </p>
        <p>
          <strong>Placement</strong> : pendant tes {PLACEMENT_MATCHES} premiers matchs de la saison, chaque victoire compte double (
          <strong>
            +{WIN_POINTS_MIN * 2} à +{WIN_POINTS_MAX * 2}
          </strong>
          ), les défaites restent normales.
        </p>
        <p>Les points en jeu (victoire et défaite) s&apos;affichent avant chaque match, dans la fenêtre « Match trouvé » et le salon.</p>
        <p>Les rangs :</p>
        <ul>
          {[...RANKS].reverse().map((rank) => (
            <li key={rank.name}>
              <strong>{rank.name}</strong> : à partir de {rank.min} points, défaite <strong>-{rank.loss}</strong>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  ...(MATCH_TEAM_ENABLED ? DIVISION_SECTIONS() : []),
  {
    id: "evenements",
    group: "GTA 6",
    title: "Événements GTA 6",
    content: (
      <ul>
        <li>L&apos;inscription à un événement engage à y participer.</li>
        <li>
          En cas d&apos;empêchement, désinscris-toi depuis la page de l&apos;événement pour libérer ta place. Des absences répétées sans
          désinscription peuvent mener à un refus d&apos;inscription aux prochains événements.
        </li>
      </ul>
    ),
  },
];

const GROUP_ORDER = ["Général", "Classé", "Division", "Tournoi", "GTA 6"];
const ORDERED = [...SECTIONS].sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));

/** Règlement de la plateforme, par catégories : général, classé, Division, tournoi, GTA 6. */
export default function RulesPage() {
  return (
    <LegalPage
      eyebrow="Fair-play"
      title="Règlement"
      description={MATCH_TEAM_ENABLED ? "Les règles de SixSence : général, classé, Division, tournoi et événements GTA 6." : "Les règles du classé SixSence : file d'attente, sanctions, déroulement des matchs, points et saisons."}
      updated="21 octobre 2026"
      sections={ORDERED}
    />
  );
}
