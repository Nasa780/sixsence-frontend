/**
 * Nouveautés : le journal des mises à jour, de la plus récente à la plus ancienne. Ajouter une entrée en
 * tête de RELEASES à chaque mise à jour visible des joueurs (titre court, une phrase, lien éventuel).
 * Page /nouveautes, et bouton « Remplir avec la dernière mise à jour » des annonces Discord de l'admin.
 */
export const RELEASES = [
  {
    date: "2026-10-28",
    title: "Prêt automatique",
    items: [
      { tag: "Classé", text: "Nouvelle option « Prêt automatique » sur la page de la file : ton « Prêt ? » est accepté tout seul dès qu'un match est trouvé.", href: "/cod/ranked" },
    ],
  },
  {
    date: "2026-10-28",
    title: "Bande en direct",
    items: [
      { tag: "Site", text: "Accueil : une bande défile en bas de l'écran, avec ce qui se passe en direct, sinon la fin de saison, les leaders, le dernier match et ce qui arrive." },
      { tag: "Site", text: "Page MW4 : barre « Ma saison » en haut, avec ton Classé et ton équipe." },
    ],
  },
  {
    date: "2026-10-28",
    title: "En direct sur l'accueil",
    items: [
      { tag: "Site", text: "Accueil : un panneau « En direct » montre ce qui se passe maintenant (matchs classés, Division, coupes, GTA 6) et les dernières actions." },
      { tag: "Site", text: "Page MW4 : les cartes donnent une info utile même quand c'est calme (file ouverte, équipes actives, prochaine coupe)." },
      { tag: "Site", text: "Menu : MW4 s'ouvre sur Classé, Division et Tournoi." },
    ],
  },
  {
    date: "2026-10-28",
    title: "FAQ",
    items: [
      { tag: "Site", text: "Questions fréquentes : compte, Classé, Division, tournois, Discord, avec une recherche et un lien direct vers chaque réponse.", href: "/faq" },
      { tag: "Site", text: "Installer l'appli sur iPhone : la marche à suivre de Safari en 4 étapes illustrées, et un guide pour les autres navigateurs." },
    ],
  },
  {
    date: "2026-10-28",
    title: "Coupes, saison et parcours",
    items: [
      { tag: "Tournoi", text: "Fiche de coupe en onglets (Infos, Tableau, Équipes, Récompenses, Règles), avec ce que rapporte chaque place et le déroulé en 5 étapes.", href: "/cod/tournoi" },
      { tag: "Tournoi", text: "Play-in : les 7e et 8e du circuit affrontent les 2 meilleures équipes de la Division pour les dernières places de la grande finale.", href: "/cod/circuit" },
      { tag: "Site", text: "Classements : compte à rebours de fin de saison et nombre de matchs joués dans la saison." },
      { tag: "Division", text: "Historiques : le score de chaque map (« Lotus 6-3 ») sur le profil et les fiches d'équipe." },
      { tag: "Division", text: "Profil : ton parcours en Division (équipes, rôle, dates, matchs et trophées) ; fiche d'équipe : trophées comptés par type." },
      { tag: "Division", text: "Premiers pas en Division : une fois ton compte prêt, les étapes pour jouer ton premier match et ta première coupe." },
    ],
  },
  {
    date: "2026-10-27",
    title: "Circuit SixSence",
    items: [
      { tag: "Tournoi", text: "Circuit SixSence : chaque Coupe Horus rapporte des points, les meilleures équipes du circuit se qualifient pour la grande finale de la saison.", href: "/cod/circuit" },
      { tag: "Division", text: "Seconde chance : les 2 dernières places de la grande finale reviennent aux meilleures équipes de la Division." },
    ],
  },
  {
    date: "2026-10-27",
    title: "Profils et équipes",
    items: [
      { tag: "Division", text: "Match programmé : choisis l'heure au quart d'heure près (jusqu'à 48 h), l'adversaire est dévoilé 5 min avant.", href: "/cod/division" },
      { tag: "Site", text: "Accueil : « En ce moment », avec les podiums du Classé et de la Division, la prochaine coupe et les records du moment." },
      { tag: "Classé", text: "Profil : nouvelle section Analyse, avec ta place sur le site pour chaque chiffre, ton ratio sur 30 jours, tes adversaires et coéquipiers fréquents, ton activité et tes équipes." },
      { tag: "Classé", text: "Face à face : sur le profil d'un joueur, ton bilan contre lui." },
      { tag: "Division", text: "Fiche d'équipe : force de l'équipe, recrutement ouvert ou fermé avec un message, et une devise pour chaque joueur choisie par les Leaders." },
    ],
  },
  {
    date: "2026-10-27",
    title: "Tournois et défis",
    items: [
      { tag: "Tournoi", text: "Check-in des coupes Horus et du tournoi de saison : n'importe quel joueur de l'équipe peut le faire, plus seulement un Leader." },
      { tag: "Site", text: "Nouveaux écrans de chargement aux couleurs de SixSence, avec une astuce à chaque fois." },
      { tag: "Division", text: "Défis : un défi officiel par semaine et par équipe, les amicaux restent illimités." },
      { tag: "Tournoi", text: "Matchs de tournoi : une équipe hôte tirée au sort donne de nouveau le code de la partie, et la feuille de match passe aux couleurs des tournois." },
      { tag: "Tournoi", text: "Tableaux : les matchs validés s'affichent bien comme terminés." },
      { tag: "Tournoi", text: "Les arbitres peuvent corriger les scores d'un match de tournoi après validation." },
    ],
  },
  {
    date: "2026-10-27",
    title: "Règles de match",
    items: [
      { tag: "Classé", text: "Règles de match Modern Warfare 4 : paramètres de la partie privée onglet par onglet, classe autorisée et atouts imposés, glitchs et déconnexions.", href: "/reglement#regles-essentiel" },
      { tag: "Site", text: "Mode hôte : une liste à cocher facultative des réglages de la partie privée, aussi sur la feuille de match." },
    ],
  },
  {
    date: "2026-10-23",
    title: "Modern Warfare 4 est là",
    items: [
      { tag: "Classé", text: "Les 13 maps de Modern Warfare 4 remplacent les anciennes, en Classé, en Division et en Tournoi." },
      { tag: "Site", text: "Page Map pool : les maps qui peuvent tomber dans chaque mode.", href: "/cod/maps" },
      { tag: "Classé", text: "Match trouvé : la map tirée au sort s'affiche en fond, sur le site comme sur Discord." },
    ],
  },
  {
    date: "2026-10-22",
    title: "Renommée, défis et ligues",
    items: [
      { tag: "Discord", text: "Tickets : ouvre un ticket sur le serveur pour une contestation, une question, un signalement ou un bug, l’équipe te répond en privé." },
      { tag: "Discord", text: "Annonces du bot : trophées, événements GTA 6 et fin de saison, avec les notifications que tu choisis en rejoignant le serveur." },
      { tag: "Division", text: "Défis directs : défie une équipe depuis sa fiche, en amical (sans points) ou officiel (points de Division), maintenant ou à l'heure de ton choix." },
      { tag: "Division", text: "Ligues de Division : Élite, Ligue 1 et Ligue 2 avec montées et descentes, activées dès 16 équipes.", href: "/cod/equipes" },
      { tag: "Classé", text: "Score de fiabilité sur le profil : il récompense les joueurs qui vont au bout de leurs matchs." },
      { tag: "Classé", text: "Remplis ton identifiant Activision depuis une capture de ton profil COD, lue directement dans ton navigateur.", href: "/cod/profile" },
      { tag: "Site", text: "Renommée, le Bureau des Légendes : champions de saison, vainqueurs des trophées, MVP du mois et records de tous les temps.", href: "/renommee" },
      { tag: "Classé", text: "Joueur et match de la semaine, et un fil d'activité en direct sur la page MW4.", href: "/cod" },
      { tag: "Site", text: "Chaîne Twitch sur le profil, avec le lecteur intégré." },
      { tag: "Division", text: "Carte d'équipe à partager : un aperçu soigné quand tu colles le lien de ton équipe sur Discord." },
      { tag: "Classé", text: "Les récompenses de fin de saison sont affichées sur le classement.", href: "/cod/leaderboard" },
      { tag: "Tournoi", text: "Onglet Tournoi dans l'historique du profil." },
      { tag: "Site", text: "Calendrier des trophées et des événements, à ajouter à ton agenda.", href: "/calendrier" },
    ],
  },
  {
    date: "2026-10-21",
    title: "Trophées Horus et Anubis",
    items: [
      { tag: "Tournoi", text: "Coupe Anubis : inscris-toi seul, les équipes sont tirées au sort. Médailles or, argent et bronze sur ton profil.", href: "/cod/tournoi?coupe=anubis" },
      { tag: "Tournoi", text: "Coupe Horus : coupes d'équipe ouvertes à l'inscription, trophées et points de Division. Élimination directe ou double élimination.", href: "/cod/tournoi" },
      { tag: "Discord", text: "Commandes du bot : /profil, /classement, /equipe, /trophees, /file, /match et /site." },
      { tag: "Site", text: "Nouveau logo, nouvelle icône de l'appli et nouvel aperçu des liens." },
      { tag: "Site", text: "Règlement réorganisé par mode, avec la règle de déconnexion." },
    ],
  },
  {
    date: "2026-10-20",
    title: "La Division est ouverte",
    items: [
      { tag: "Division", text: "Crée ton équipe, lance une recherche et affronte les autres équipes en BO3. Classement des équipes en direct.", href: "/cod/division" },
      { tag: "Classé", text: "Le classé se joue désormais en solo, du 2v2 au 5v5.", href: "/cod/ranked" },
    ],
  },
];
