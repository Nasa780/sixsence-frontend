/**
 * Questions fréquentes (page /faq) : thème, question, réponse courte. `id` sert de lien direct (/faq#id) ;
 * `guide` affiche la marche à suivre d'installation (InstallGuide) sous la réponse. Garder les chiffres alignés
 * sur le règlement et le backend (barème, délais, tailles d'équipe).
 */
export const FAQ_THEMES = [
  { id: "compte", label: "Compte", color: "#d4af37" },
  { id: "classe", label: "Classé", color: "#34d399" },
  { id: "division", label: "Division", color: "#22d3ee" },
  { id: "tournoi", label: "Tournois", color: "#e5484d" },
  { id: "discord", label: "Discord", color: "#8b9cff" },
  { id: "souci", label: "Un souci ?", color: "#d4af37" },
];

export const FAQ = [
  // --- Compte ---
  { id: "creer-compte", theme: "compte", q: "Comment je crée mon compte ?", a: "Connecte-toi avec Discord : c'est ton seul accès. Ton pseudo et ton avatar viennent de Discord, rien d'autre à créer." },
  { id: "activision", theme: "compte", q: "Pourquoi mon identifiant Activision est obligatoire ?", a: "Tes coéquipiers en ont besoin pour t'inviter dans la partie privée. Renseigne-le sur ton profil ; un identifiant ne sert qu'à un seul compte." },
  { id: "installer-iphone", theme: "compte", q: "Comment installer l'appli sur iPhone ?", a: "Avec Safari, en 4 étapes. C'est indispensable sur iPhone pour recevoir les notifications.", guide: "ios" },
  { id: "installer-android", theme: "compte", q: "Comment installer l'appli sur Android ou ordinateur ?", a: "Touche « Installer l'application » (barre du haut ou menu du site) : avec Chrome, Edge, Samsung Internet ou Opera, l'installation se fait en un clic. Sinon, la marche à suivre de ton navigateur s'affiche." },
  { id: "notifications", theme: "compte", q: "Comment recevoir l'alerte « Match trouvé » site fermé ?", a: "Active les notifications depuis « Premiers pas » sur la page MW4. Sur Android et ordinateur, ça marche directement dans le navigateur ; sur iPhone, installe d'abord l'appli." },
  { id: "carte-visite", theme: "compte", q: "Comment changer ma carte de visite ?", a: "Sur ton profil, « Changer de carte ». Les cartes se débloquent en jouant : rangs, succès, MVP, saisons." },

  // --- Classé ---
  { id: "points-victoire", theme: "classe", q: "Combien de points je gagne ?", a: "Entre +40 et +60 par victoire selon le niveau des adversaires (+50 à niveau égal). Pendant tes 10 premiers matchs de la saison, les victoires comptent double." },
  { id: "points-defaite", theme: "classe", q: "Pourquoi j'ai perdu plus de points qu'un coéquipier ?", a: "La défaite dépend de ton rang : -15 en Bronze, -20 en Argent, -25 en Or, -30 en Platine, -35 en Diamant, -50 dès Maître, ajustée de ±30 % selon l'équipe adverse." },
  { id: "rangs", theme: "classe", q: "Comment marchent les rangs ?", a: "Un rang tous les 300 points : Bronze, Argent, Or, Platine, Diamant, Maître, Grand Maître, Champion (2 100), puis Légende à 3 000. On ne descend jamais sous 0." },
  { id: "pret", theme: "classe", q: "Comment se passe la minute après « Match trouvé » ?", a: "Une alarme et une notification te préviennent, puis un compte à rebours d'une minute : prépare-toi et rejoins le vocal. Le match démarre tout seul, rien à cliquer." },
  { id: "annuler-classe", theme: "classe", q: "Un joueur ne rejoint pas la partie, que faire ?", a: "Après les 15 min de lancement, votez l'annulation depuis la feuille de match : le match est annulé sans point perdu si tous les joueurs de chaque équipe sauf un votent pour. Signale aussi l'absent : un arbitre peut le sanctionner." },
  { id: "recherche", theme: "classe", q: "Combien de temps dure une recherche ?", a: "30 minutes. 5 minutes avant la fin, « Toujours là ? » te demande de confirmer : tu gardes ta place dans la file." },
  { id: "resultat", theme: "classe", q: "Qui déclare le résultat ?", a: "Une équipe déclare le vainqueur, l'autre confirme ou conteste. Sans réponse, le résultat est validé au bout de 15 minutes ; un match jamais déclaré est annulé après 3 h." },
  { id: "mvp", theme: "classe", q: "Comment est choisi le MVP ?", a: "Chaque joueur vote dans les 24 h pour un joueur de l'équipe gagnante. Le plus élu du mois reçoit le badge MVP du mois." },
  { id: "xp", theme: "classe", q: "À quoi sert l'XP ?", a: "+500 XP par victoire, +150 par défaite. Elle ne change pas ton rang et reste d'une saison à l'autre." },
  { id: "fin-saison", theme: "classe", q: "Que se passe-t-il à la fin de la saison ?", a: "Le classement est archivé, les points repartent à zéro et l'XP est gardée. Cartes de saison : Participant, Top 10 et Champion." },
  { id: "avertissements", theme: "classe", q: "Que valent les avertissements ?", a: "Sur 24 h glissantes : le 1er ne fait rien, le 2e bloque la file 15 minutes, le 3e 1 heure, puis 24 heures." },

  // --- Division ---
  { id: "creer-equipe", theme: "division", q: "Comment créer ou rejoindre une équipe ?", a: "Avec ton Discord et ton identifiant Activision liés, crée la tienne ou candidate depuis la fiche d'une équipe. Un Leader peut aussi t'inviter par lien." },
  { id: "effectif", theme: "division", q: "Combien de joueurs dans une équipe ?", a: "8 au plus. Un Leader choisit les 4 joueurs de chaque match parmi l'effectif." },
  { id: "roles", theme: "division", q: "Qui fait quoi dans l'équipe ?", a: "Les Leaders lancent les matchs, invitent et gèrent l'effectif. Le créateur porte la couronne : il nomme les Leaders et peut la transmettre." },
  { id: "changer-equipe", theme: "division", q: "Je peux changer d'équipe quand je veux ?", a: "Oui, 24 h après avoir quitté la précédente. Les transferts sont bloqués pendant le tournoi de saison et les 7 derniers jours de la saison." },
  { id: "deroule", theme: "division", q: "Comment se passe un match de Division ?", a: "BO3 en 6 manches gagnantes par map, maps tirées au sort. L'équipe hôte, tirée au sort, donne le code de la partie dans le tchat de la feuille de match." },
  { id: "programmer", theme: "division", q: "Comment programmer un match ce soir ?", a: "Un Leader choisit un créneau au quart d'heure, jusqu'à 48 h. Rappel 30 minutes avant ; l'adversaire est dévoilé 5 minutes avant." },
  { id: "defis", theme: "division", q: "Quelle différence entre un défi amical et officiel ?", a: "L'amical ne compte pas. L'officiel rapporte des points de Division : un seul par équipe sur 7 jours." },
  { id: "forfait", theme: "division", q: "Que se passe-t-il en cas de forfait ?", a: "L'équipe forfait perd le match. Plus de 3 forfaits perdus en 7 jours : recherche bloquée 24 h." },

  // --- Tournois ---
  { id: "horus", theme: "tournoi", q: "Comment marche la Coupe Horus ?", a: "Un Leader inscrit l'équipe. Il faut 4 équipes présentes au check-in. Trophées or, argent et bronze, points de Division et points de circuit." },
  { id: "anubis", theme: "tournoi", q: "Je n'ai pas d'équipe, je peux jouer une coupe ?", a: "Oui, la Coupe Anubis : tu t'inscris seul, les équipes sont tirées au sort au début. Médailles sur ton profil." },
  { id: "check-in", theme: "tournoi", q: "Comment marche le check-in ?", a: "N'importe quel joueur de l'équipe le fait entre 2 h et 15 minutes avant le début et choisit les joueurs du match. Sans check-in, l'équipe est forfait." },
  { id: "grande-finale", theme: "tournoi", q: "Comment se qualifier pour la grande finale ?", a: "Par le circuit : chaque Coupe Horus de la saison rapporte des points. Les 2 dernières places se jouent au play-in contre les meilleures équipes de la Division." },

  // --- Discord ---
  { id: "messages-bot", theme: "discord", q: "Je ne reçois pas les messages du bot.", a: "Autorise les messages privés des membres du serveur SixSence (paramètres de confidentialité du serveur, sur Discord)." },
  { id: "vocal", theme: "discord", q: "Où est le vocal de mon match ?", a: "Créé automatiquement au début du match, avec un accès pour chaque joueur. Le bouton est dans le message « C'est parti » du bot." },
  { id: "roles-discord", theme: "discord", q: "Comment j'obtiens mon rôle de rang ?", a: "Automatiquement après chaque match classé, selon ton rang." },

  // --- Un souci ---
  { id: "erreur-resultat", theme: "souci", q: "Je me suis trompé de résultat.", a: "Demande une correction depuis la feuille de match dans les 24 h (motif « Erreur de déclaration ») : un arbitre corrige." },
  { id: "contester", theme: "souci", q: "L'autre équipe a déclaré un faux résultat.", a: "Conteste depuis la feuille de match et ajoute tes captures : un arbitre tranche." },
  { id: "triche", theme: "souci", q: "Un joueur triche ou ne respecte pas les règles.", a: "Signale-le depuis la feuille de match avec une capture, ou ouvre un ticket « Signalement » sur Discord." },
  { id: "bug", theme: "souci", q: "J'ai trouvé un bug.", a: "Ouvre un ticket « Bug » sur Discord avec une capture et ce que tu faisais : on corrige vite." },
];
