/**
 * Règles de match Modern Warfare 4 (R&D Hardcore) : paramètres de la partie privée, classe autorisée et conduite.
 * Affichées dans le règlement (/reglement) et sur les feuilles de match (bloc « Paramètres de la partie »).
 * Le Hardcore est simulé (santé 15, sans régénération ni mini-carte) : le vrai mode Hardcore fait planter le jeu.
 */

/** Manches à gagner par map : 8 en BO1 (Classé), 6 en BO3 / BO5 (Division, tournois). */
export const roundsToWin = (bestOf) => (bestOf > 1 ? 6 : 8);

export const MATCH_FORMATS = [
  { id: "bo1", label: "Classé · BO1", bestOf: 1, color: "#34d399" },
  { id: "bo3", label: "Division · Tournoi · BO3 – BO5", bestOf: 3, color: "#22d3ee" },
];

/**
 * Onglets du menu « Règles du jeu » de la partie privée, dans l'ordre du jeu et avec ses libellés exacts.
 * def : valeur par défaut du mode CDL Recherche et destruction ; set : valeur à régler ; lock : réglage à ne pas toucher.
 */
export function settingsTabs(bestOf) {
  const rounds = roundsToWin(bestOf);
  return [
    {
      id: "JEU",
      rows: [
        { label: "Limite de temps par manche", def: "1 min 30 s", set: "1 min 45 s" },
        { label: "Nombre de manches à gagner", def: "6 manches", set: rounds === 6 ? null : `${rounds} manches` },
        { label: "Changement de manche", def: "À chaque manche" },
        { label: "Victoire par deux manches", def: "Désactivé" },
        { label: "Début de la partie", def: "30 secondes" },
        { label: "Début de manche", def: "10 secondes", set: "5 secondes" },
        { label: "Passer la séquence d'infiltration", def: "Activé" },
        { label: "Autoriser l'échange d'entrée", def: "Désactivé" },
        { label: "Apparition de bot en cas de mort", def: "Désactivé" },
        { label: "Activer les pings d'indication", def: "Désactivé" },
        { label: "Normaliser la latence", def: "Désactivé" },
      ],
    },
    {
      id: "AVANCÉ",
      rows: [
        { label: "Délai explosion", def: "45 secondes" },
        { label: "Délai de pose", def: "5 secondes" },
        { label: "Délai de désamorçage", def: "7,5 secondes", set: "5 secondes" },
        { label: "Multi-bombe", def: "Désactivé" },
        { label: "Pose/désamorçage silencieux", def: "Activé" },
        { label: "Progression de pose/désamorçage", def: "Activé", set: "Désactivé" },
      ],
    },
    {
      id: "JOUEUR",
      rows: [
        { label: "Nombre de vies", def: "1 vie" },
        { label: "Santé max", def: "Par défaut (100)", set: "15" },
        { label: "Régénération de santé", def: "Par défaut", set: "Désactivé" },
        { label: "Activer protection", def: "Désactivé" },
        { label: "Stabilisation de l'arme", def: "Désactivé" },
        { label: "Baroud d'honneur", def: "Désactivé" },
      ],
    },
    {
      id: "ÉQUIPE",
      rows: [
        { label: "Spectateur", def: "Vue du joueur" },
        { label: "Killcam", def: "Désactivé" },
        { label: "Activer mini-carte", def: "Activé", set: "Désactivé" },
        { label: "Tir d'arme sur la boussole", def: "Désactivé" },
        { label: "Mission de l'équipe", def: "Désactivé" },
        { label: "Tir allié", def: "Activé" },
      ],
    },
    {
      id: "GAMEPLAY",
      rows: [
        { label: "Largages de colis stratégique", def: "Désactivé" },
        { label: "Caméra d'apparition", def: "Désactivé" },
        { label: "Mode Hardcore", def: "Désactivé", lock: "Ne pas activer : le jeu plante" },
        { label: "Chargeurs à l'apparition", def: "Par défaut (3)" },
        { label: "Tirs dans la tête uniquement", def: "Désactivé" },
        { label: "Vol de santé", def: "Désactivé" },
        { label: "Minuteur d'Enragé", def: "Désactivé" },
        { label: "Activer amélioration de combat", def: "Activé", set: "Désactivé" },
        { label: "Activer les atouts", def: "Activé" },
        { label: "Activer série d'éliminations", def: "Activé", set: "Désactivé" },
        { label: "Délai des équipements", def: "Désactivé" },
        { label: "Protection d'équipement", def: "Désactivé", set: "7,5 secondes" },
        { label: "Discussion en combat", def: "Désactivé" },
        { label: "Dialogue de l'annonceur", def: "Activé", set: "Désactivé" },
      ],
    },
  ];
}

/** Réglages à changer pour un format, dans l'ordre du menu (liste à cocher de l'hôte). */
export const settingsToChange = (bestOf) => settingsTabs(bestOf).flatMap((tab) => tab.rows.filter((row) => row.set).map((row) => ({ ...row, tab: tab.id })));

export const ESSENTIALS = [
  { key: "format", title: "Format", lines: ["Classé : BO1, 8 manches", "Division : BO3 ou BO5, 6 manches", "Tournois : BO1 en 8 manches, BO3 ou BO5 en 6"] },
  { key: "hardcore", title: "Hardcore", lines: ["15 PV, sans régénération", "Sans mini-carte, tir allié activé", "Sans séries ni améliorations"] },
  { key: "weapons", title: "Armes", lines: ["Fusils d'assaut, mitraillettes", "Fusils tactiques", "Snipers à verrou"] },
  { key: "perks", title: "Atouts", lines: ["Fantôme", "Ruée ou Ninja", "Sang-froid"] },
  { key: "disconnect", title: "Déconnexion", lines: ["Une pause de 5 minutes", "par équipe et par map"] },
  { key: "banned", title: "Interdit", lines: ["Glitchs et snaking", "Skins spéciaux", "Joueurs hors effectif"] },
];

/** Classe : [nom, autorisé, précision]. */
export const LOADOUT = [
  {
    title: "Armes principales",
    items: [
      ["Fusils d'assaut", true, "Tous"],
      ["Mitraillettes", true, "Toutes"],
      ["Fusils tactiques", true, "Tous"],
      ["Fusils de précision", true, "À verrou seulement"],
      ["Fusils à pompe", false],
      ["Mitrailleuses", false],
    ],
  },
  {
    title: "Armes secondaires",
    items: [
      ["Armes de poing", true, "Semi-automatiques"],
      ["Corps à corps", true, "Couteau seulement"],
      ["Lanceurs", false],
    ],
  },
  {
    title: "Accessoires",
    items: [
      ["Viseurs courte portée et reflex", true],
      ["Lanceurs et pompes sous le canon", false],
      ["Modes APEX", false],
    ],
  },
  { title: "Équipement mortel", items: [["Grenade Frag", true], ["Bombe collante", true], ["Couteau de lancer", true], ["Tout le reste", false]] },
  { title: "Équipement tactique", items: [["Flash", true], ["Paralysante", true], ["Fumigène", true], ["Tout le reste", false]] },
  { title: "Opérateurs", items: [["Apparences par défaut", true], ["Skins spéciaux", false], ["MILSIM · KSK Arctique", false]] },
];

export const PERKS = [
  ["Atout 1", "Fantôme"],
  ["Atout 2", "Ruée ou Ninja"],
  ["Atout 3", "Sang-froid"],
];

/** Rappel court des interdits, affiché à tous les joueurs sur la feuille de match. */
export const BANNED_SHORT = ["Fusils à pompe", "Mitrailleuses", "Lanceurs", "Snipers hors verrou", "Modes APEX", "Skins spéciaux"];

export const CONDUCT = [
  {
    key: "glitch",
    title: "Glitchs",
    text: "Sortir de la carte, voir à travers les murs, exploiter une faille : interdit. Vous le voyez en jeu ? Arrêtez la partie et prévenez l'arbitre. Si vous continuez, la map est considérée comme acceptée.",
  },
  {
    key: "snaking",
    title: "Snaking",
    text: "Se coucher et se relever plus de deux fois d'affilée derrière le même obstacle pour voir sans être vu : interdit, sur toutes les maps et avec toutes les armes.",
  },
  {
    key: "disconnect",
    title: "Déconnexion d'un joueur",
    text: "Une pause de 5 minutes par équipe et par map, demandée en fin de manche ou dans les premières secondes d'une manche. Sans retour du joueur, la partie reprend au même score, en infériorité.",
  },
  {
    key: "host",
    title: "Perte de l'hôte",
    text: "L'équipe en supériorité numérique au moment de la coupure gagne la manche ; à égalité, la manche est rejouée. L'hôte recrée la partie et elle reprend au score exact.",
  },
  {
    key: "settings",
    title: "Mauvais paramétrage",
    text: "On s'arrête dès qu'on le remarque, l'hôte recrée la partie avec les bons réglages et on reprend au score exact : les manches déjà jouées comptent.",
  },
  {
    key: "proof",
    title: "Preuves",
    text: "Une capture d'écran du tableau des scores pour le résultat. Un clip d'au moins 30 secondes, avec le son, pour signaler un glitch, du snaking ou une classe interdite.",
  },
  {
    key: "cam",
    title: "Contrôle cam",
    text: "En cas de soupçon de triche, l'arbitre peut exiger une monitor cam ou une handcam. Refuser le contrôle vaut défaite.",
  },
  {
    key: "roster",
    title: "Joueurs",
    text: "Seuls les joueurs du match jouent, chacun avec son propre compte Activision, celui renseigné sur SixSence. Pas de remplaçant extérieur.",
  },
];
