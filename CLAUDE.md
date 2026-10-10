# CLAUDE.md

Guide pour Claude Code (et tout contributeur) travaillant sur le **frontend de SixSence**, une plateforme de compétition avec matchmaking, mode Ranked et classement.

L'API backend vit dans un dépôt séparé : `Nasa780/sixsence-backend`.

## Stack

- Next.js (Pages Router), React, Tailwind CSS
- Mélange de JavaScript (`pages/`, `hooks/`, `utils/`) et de TypeScript (`components/*.tsx`)
- Déployé sur Vercel (sixsence.fr, sixsence.vercel.app)

## Commandes

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm start
```

Il n'y a pas encore de tests automatisés ni de linter configuré : vérifier avec `npm run build`.

## Structure

- `src/pages/` : `index`, `accueil`, `queue`, `ranked`, `profile`, `auth/callback` (retour de la connexion Discord).
- `src/components/` : la plupart des composants existent en deux versions, desktop (`Xxx.tsx`) et mobile (`XxxMobile.tsx`). Une modification visuelle doit généralement être faite dans les deux.
- `src/hooks/useUser.js` et `src/utils/auth.js` : récupération de l'utilisateur connecté via `/me`.
- `src/styles/globals.css` et `tailwind.config.js` : styles globaux et thème.
- `public/assets/` et `public/images/` : icônes et images statiques.

## Backend et authentification

- L'URL de l'API (`https://sixsence-backend.onrender.com`) est codée en dur dans de nombreux fichiers (pages, composants, `utils/auth.js`, `hooks/useUser.js`). Pour la changer, chercher `sixsence-backend.onrender.com` dans `src/`.
- La connexion passe par Discord OAuth (`/auth/discord` côté backend), puis le jeton de session est stocké dans `localStorage` sous la clé `session` et envoyé en `Authorization: Bearer`.
- Routes backend utilisées : `/me`, `/leaderboard/top10`, `/queue/join`, `/queue/leave`, `/queue/status`, `/queue/list`.

## Conventions

- Textes de l'interface, code et commentaires en français.
- Ne pas committer `node_modules/` ni les fichiers `.env*` (déjà dans `.gitignore`).
