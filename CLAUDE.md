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

Noir (`ink`), or métallique (`gold`), formes tactiques. Polices via `next/font` dans `_app.js` : Saira Condensed (`font-display`, titres), Orbitron (`font-tech`, chiffres HUD), Inter (`font-sans`).
Utilitaires maison dans `globals.css` : `clip-tactical`, `clip-slant`, `clip-corner`, `bg-gold-sheen`, `text-gold-gradient`, `text-outline`, `bg-grid`, `mask-fade`, `holo`, `glow-gold`.

## Structure

- `src/pages/` : `/`, `/cod` (hub), `/cod/ranked`, `/cod/match/[id]`, `/cod/groupe/[code]` (invitation de groupe), `/cod/leaderboard`, `/cod/profile`, `/cod/profile/[id]`, `/gta6`, `/gta6/events`, `/gta6/events/[id]`, `/founders`, `/partners`, `/login`, `/auth/callback`, `/admin` (rôle admin), `/reglement`, `/mentions-legales`, `/confidentialite`, `/sitemap.xml`, `/api/og` (image d'aperçu des liens), `/api/og/player?id=` (carte de joueur, aperçu des profils), `404`.
- `src/components/ui/` : briques communes (Button / ButtonLink, TacticalCard, Typography, Feedback, Avatar, Logo, LoginPrompt, ErrorBoundary : écran « Petit accroc » si une page plante).
- `src/components/layout/` : Navbar (fixe, menu mobile) et Footer, posés par `_app.js` sur toutes les pages sauf `/auth/callback`.
- `src/components/cod/`, `gta/`, `home/`, `effects/` : écrans et effets (GoldParticles, Reveal). `cod/PerformancePanel` : panneau « Performance » du profil (courbe de la saison, paliers de rang, chiffres clés, forme) ; `cod/OnboardingPanel` : « Premiers pas » sur le hub COD. Rangs : `cod/RankEmblem` (emblème SVG et effets : reflet dès Diamant, halo Champion+, braises Légende), `cod/RankBars`, `cod/RankBadge`, `cod/RankUpOverlay` (écran « Promotion » après un match).
- `src/components/admin/` : panneau d'administration (contestations, joueurs et badges, événements, fondateurs, partenaires, clôture de saison).
- `src/hooks/` : `useSession`, `useUser` (joueur + profil COD), `useQueueSocket` (WebSocket de la file, vérification « Prêt ? »), `useCountdown`, `useSeasons` (saison active, badges de saison), `useSiteStats`, `useTopPlayers`, `useGtaEvents`.
- `src/lib/` : `config.js` (URL de l'API, clé publique Supabase), `supabase.js`, `auth.js` (connexion Discord), `api.js` (appels au backend avec le jeton), `ranks.js` (9 rangs, teintes métalliques light/color/dark/text, `rankGradient`, `rankLevel`, constantes du barème), `rankEmblem.js` (emblèmes SVG en adresse data:, aussi utilisés par la carte de joueur next/og), `moderation.js` (motifs d'arbitrage et de signalement, badge MVP du mois), `notify.js` (son, notification et titre clignotant « match trouvé »), `legal.js` (identité de l'éditeur pour les pages légales), `push.js` (appli installable, notifications push ; voir `public/manifest.webmanifest` et `public/sw.js`), `performance.js` (courbe des points reconstruite depuis `points_changes`), `monitoring.js` (erreurs du navigateur envoyées à `POST /errors` du backend, jamais depuis localhost).

## Règles

- Tout le site est **public** ; la connexion Discord n'est exigée que pour la file, son propre profil, le vote et le chat de match, et l'inscription aux événements.
- Le navigateur **lit** Supabase (RLS en lecture publique) ; toutes les **écritures** passent par le backend (`lib/api.js`). Seule exception : `activision_id` et `platform` de son propre profil.
- Barème calculé par le backend (`cod_points_preview`) : rangs tous les 300 points (Bronze 0 … Champion 2100), puis Légende à 3000 ; victoire +50 pour tous ; défaite -20 (Bronze, Argent), -35 (Or, Platine, Diamant), -50 (Maître et au-delà) ; placement : 10 premiers matchs de la saison, victoires doublées (+100). Le site affiche les points en jeu reçus du backend (`PointsAtStake`) ; garder les textes et `lib/ranks.js` alignés sur la migration 0013.
- Match trouvé : vérification « Prêt ? » d'une minute (`COD_READY_SECONDS` côté backend). Les preuves (captures) sont envoyées dans le bucket Storage `match-proofs` puis enregistrées par `POST /cod/matches/:id/proofs`.
- Ne jamais mettre la clé secrète Supabase dans le frontend.
- Une vérification automatique (`.github/workflows/ci.yml`) construit le site à chaque PR.

## Conventions

- Textes de l'interface, code et commentaires en français.
