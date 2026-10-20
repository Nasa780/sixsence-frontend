# CLAUDE.md

Guide pour Claude Code (et tout contributeur) travaillant sur le **frontend de SixSence**, plateforme gaming : classé Call of Duty en 2v2, 3v3, 4v4 et 5v5 (Recherche & Destruction Hardcore uniquement), seul ou en groupe (files, matchs, points, classement) et événements GTA 6.

L'API vit dans un dépôt séparé : `Nasa780/sixsence-backend` (Express + WebSocket sur Render, Supabase).

## Stack

- Next.js 16 (Pages Router), React 19, JavaScript (JSX)
- Tailwind CSS v4 (thème en CSS dans `src/styles/globals.css`, pas de `tailwind.config` chargé)
- framer-motion (animations), tsParticles (particules dorées), react-icons
- Supabase JS : connexion Discord (Supabase Auth) et lectures publiques
- Déployé sur Vercel (`www.sixsence.fr`) : chaque commit sur `main` part en production, chaque PR a un aperçu.

## Commandes

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # à lancer avant chaque PR (pas de tests ni de linter)
```

## Identité visuelle

Noir (`ink`), or métallique (`gold`), formes tactiques. Code couleur par mode COD (`data-univers` posé par `_app.js` d'après `codModeOf`, variables `--color-gold*` redéfinies dans `globals.css`) : Classé vert émeraude, Division cyan néon, Tournoi rouge impérial ; GTA 6 coucher de soleil ; or partout ailleurs. Polices via `next/font` dans `_app.js` : Saira Condensed (`font-display`, titres), Orbitron (`font-tech`, chiffres HUD), Inter (`font-sans`).
Utilitaires maison dans `globals.css` : `clip-tactical`, `clip-slant`, `clip-corner`, `bg-gold-sheen`, `text-gold-gradient`, `text-outline`, `bg-grid`, `mask-fade`, `holo`, `glow-gold`.

## Structure

- `src/pages/` : `/`, `/cod` (hub), `/cod/ranked`, `/cod/match/[id]`, `/cod/groupe/[code]` (invitation de groupe), `/cod/leaderboard`, `/cod/equipes` (classement des équipes), `/cod/equipes/[id]` (fiche d'équipe), `/cod/equipes/creer`, `/cod/division` (file Division : recherche d'un match pour son équipe avec `PlayPanel`, compteurs `GET /teams/status`, règles ; comme `/cod/ranked`), `/cod/equipe` (Mon équipe : bannière d'équipe `TeamHero` avec place, points, bilan, forme, série, trophées et bouton Lancer un match / Feuille de match ; une seule page « Équipe » (objectifs, derniers matchs dépliables, journal, semaine, rival, records, joueurs clés, statistiques avec graphique victoires/défaites par map `MapResultsChart`, effectif) : `components/teams/TeamOverview.jsx`, `useTeamInsights` ; onglets Recrutement et Apparence pour les Leaders ; vue d'ensemble aussi : objectif de la semaine, rival, records, journal d'activité ; badges de membre Fondateur, Pilier, Vétéran, Recrue), `/cod/equipes/tournoi` (tournoi de fin de saison : check-in, tableau en direct, vainqueur), `/cod/equipes/match/[id]` (feuille d'un match d'équipe BO3 ou BO5 : maps tirées au sort dès la création, déclaration unique à la fin et confirmation, arbitrage), `/cod/profile`, `/cod/profile/[id]`, `/gta6`, `/gta6/events`, `/gta6/events/[id]`, `/founders`, `/partners`, `/login`, `/auth/callback`, `/admin` (équipe : onglets selon le rôle admin, staff ou arbitre), `/reglement`, `/mentions-legales`, `/confidentialite`, `/sitemap.xml`, `/api/og` (image d'aperçu des liens), `/api/og/player?id=` (carte de joueur, aperçu des profils), `404`.
- `src/components/ui/` : briques communes (Button / ButtonLink, TacticalCard, Typography, Feedback, Avatar, Logo, LoginPrompt, ErrorBoundary : écran « Petit accroc » si une page plante).
- **Classé en solo** (depuis le 2026-10-20) : `GROUPS_ENABLED` (`lib/config.js`, `NEXT_PUBLIC_GROUPS=on` + `COD_GROUPS=on` côté backend pour les remettre) ; en solo, pas de bloc « Jouer en groupe » (`PartyPanel` conservé), `/cod/groupe/*` en 404, textes du site écrits pour le solo (à revoir si les groupes reviennent).
- **Mode Division ouvert depuis le 2026-10-20** : `MATCH_TEAM_ENABLED` (`lib/config.js`, actif par défaut ; `NEXT_PUBLIC_MATCH_TEAM=off` sur Vercel pour le remettre en pause). En pause, le site est celui d'avant le mode : hub `ClassicHub` (classé seul), « Classement COD », pas de sélecteur de mode, de sous-menu MW4, de tags d'équipe, d'onglets admin Équipes/Tournoi ; les pages `/cod/equipe*` affichent la 404 (`_app.js`). Code conservé (`ModesHub` et pages d'équipe) ; côté backend `TEAM_MODE=on`.
- **Deux modes COD bien séparés** : le **Classé** (joueurs, 2v2 à 5v5 : `/cod/ranked`, `/cod/leaderboard`, `/cod/profile`, `/cod/match`) et les **Division** (équipes : `/cod/equipes*`, `/cod/equipe`). `cod/CodModeNav.jsx` (`COD_MODES`, `codModeOf`) : sélecteur « Classé | Division » et pages du mode, affiché automatiquement par `PageHeader` sur les pages COD (fiche d'équipe et profil public l'ajoutent eux-mêmes) ; hub `/cod` en deux blocs + top joueurs et top équipes ; menu : MW4 → Classé / Division.
- `src/components/layout/` : Navbar (fixe, menu mobile) et Footer, posés par `_app.js` sur toutes les pages sauf `/auth/callback`.
- `src/components/cod/`, `gta/`, `home/`, `effects/` : écrans et effets (GoldParticles, Reveal). `cod/PerformancePanel` : panneau « Performance » du profil (courbe de la saison, paliers de rang, chiffres clés, forme) ; `cod/OnboardingPanel` : « Premiers pas » sur le hub COD. Rangs : `cod/RankEmblem` (emblème SVG détaillé ; effets : reflet dès Diamant, halo Champion+, braises Légende), `cod/RankBars`, `cod/RankBadge`, `cod/RankUpOverlay` (écran « Promotion » après un match), `cod/RankCard` (carte de rang du profil : emblème, points, progression, pic de saison, Top %) et `cod/RankRoad` (frise « Road to Légende », sur le profil et la page de la file). Cartes de visite : `cod/CallingCard` (dessin, effets de rareté, fond du profil, bannière) et `cod/CardPicker` (fenêtre « Changer de carte », ouverte aussi par `/cod/profile?cartes=1`).
- `src/components/teams/TeamStats.jsx` (statistiques de la fiche d'équipe calculées depuis `team_matches` : victoires, maps, manches, série, maps les plus jouées) et `TeamSeasonArchive.jsx` (classement final d'une saison passée, `team_season_results`, onglets du classement des équipes).
- **Division v2** (`components/teams/PlayPanel.jsx`, feuille `/cod/equipes/match/[id]`) : plus de titulaires ni de remplaçants (une liste « Effectif »), le Leader choisit les joueurs de chaque match ; recherche de 30 min avec « Toujours là ? » (`POST /teams/me/queue/stay`) et alertes `alertTeamEvent` (`lib/notify.js` : son, titre, notification) quand le match est trouvé ou la recherche arrêtée ; adversaire anonyme ; feuille de match : équipe hôte, chat (code de la partie), « Présents en jeu », forfait (déclaré, validé ou contesté, arbitre) ; profil : historique en onglets « Classé | Division » (`GET /teams/players/:id/matches`). Recherche bloquée 24 h après plus de 3 forfaits (`blockedUntil`), transferts verrouillés (`transferLock` affiché sur Mon équipe), règlement Division et Tournoi (`/reglement`, sections affichées seulement si `MATCH_TEAM_ENABLED`), date de fin prévue de la saison dans l'admin (onglet Saison). Profil : « Récap de saison » des saisons terminées (`cod/SeasonRecap.jsx` : place, rang final et meilleur rang, bilan, MVP du mois, matchs de Division ; pas de cartes).
- `src/components/teams/TeamParts.jsx` : blason (`TeamCrest`), rôle (couronne = créateur, toujours affiché « Leader », jamais « propriétaire »), lignes d'effectif, onglets.
- `src/components/admin/` : panneau d'administration (contestations, joueurs, rôles et badges, événements, fondateurs, partenaires, clôture de saison) ; `TournamentPanel.jsx` : onglet « Tournoi » (admin : création avec aperçu des qualifiés, vainqueur désigné à la main, annulation) ; `TeamsPanel.jsx` : onglet « Équipes » (staff et admins : signalements d'équipes, retrait du logo, de la bannière ou de la description, renommage, dissolution) ; `Sanctions.jsx` : onglet « Sanctions », fenêtre « Sanctionner » (aussi depuis un signalement) et historique avec levée.
- `src/hooks/` : `useSession`, `useUser` (joueur + profil COD), `useQueueSocket` (WebSocket de la file, vérification « Prêt ? »), `useCountdown`, `useSeasons` (saison active, badges de saison), `useSiteStats`, `useTopPlayers`, `useGtaEvents`, `useTeamTags` (équipe de plusieurs joueurs, gardée pendant la visite : tag `TeamTag` à côté du pseudo au classement, sur les feuilles de match classées, et ligne d'équipe sur le profil).
- `src/lib/` : `config.js` (URL de l'API, clé publique Supabase), `supabase.js`, `auth.js` (connexion Discord), `api.js` (appels au backend avec le jeton), `ranks.js` (9 rangs, teintes métalliques light/color/dark/text, `rankGradient`, `rankLevel`, constantes du barème), `rankEmblem.js` (emblèmes SVG en adresse data:, aussi utilisés par la carte de joueur next/og), `moderation.js` (motifs d'arbitrage et de signalement, badge MVP du mois), `notify.js` (son, notification et titre clignotant « match trouvé »), `legal.js` (identité de l'éditeur pour les pages légales), `push.js` (appli installable, notifications push ; voir `public/manifest.webmanifest` et `public/sw.js`), `performance.js` (courbe des points reconstruite depuis `points_changes`), `cards.js` (rareté et dessin de chaque carte de visite, mêmes clés que `src/cards.ts` du backend ; une illustration se branche avec `art.image`), `roles.js` (rôles de l'équipe : `isReferee` admin/staff/arbitre tranche les matchs, `isModerator` admin/staff gère signalements et sanctions, `isPermanentBan`), `teams.js` (règles des équipes, couleurs, réseaux, envoi des logos et bannières dans le bucket `team-media`), `monitoring.js` (erreurs du navigateur envoyées à `POST /errors` du backend, jamais depuis localhost).

## Règles

- Tout le site est **public** ; la connexion Discord n'est exigée que pour la file, son propre profil, le vote et le chat de match, et l'inscription aux événements.
- Le navigateur **lit** Supabase (RLS en lecture publique) ; toutes les **écritures** passent par le backend (`lib/api.js`). Seule exception : `activision_id` et `platform` de son propre profil.
- Barème calculé par le backend (`cod_points_preview`) : rangs tous les 300 points (Bronze 0 … Champion 2100), puis Légende à 3000 ; victoire +50 pour tous ; défaite Bronze -15, Argent -20, Or -25, Platine -30, Diamant -35, -50 dès Maître, -25 % pour un joueur seul ; placement : 10 premiers matchs de la saison, victoires doublées (+100) ; XP : +500 par victoire, +150 par défaite (`WIN_XP`, `LOSS_XP`, migration 0024). Le site affiche les points en jeu reçus du backend (`PointsAtStake`) ; garder les textes et `lib/ranks.js` alignés sur la migration 0013.
- Match trouvé : vérification « Prêt ? » d'une minute (`COD_READY_SECONDS` côté backend). Les preuves (captures) sont envoyées dans le bucket Storage `match-proofs` puis enregistrées par `POST /cod/matches/:id/proofs`.
- Ne jamais mettre la clé secrète Supabase dans le frontend.
- Une vérification automatique (`.github/workflows/ci.yml`) construit le site à chaque PR.

## Conventions

- Textes de l'interface, code et commentaires en français.
