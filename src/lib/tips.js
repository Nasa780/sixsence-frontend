/** Astuces affichées pendant les chargements (Loading, RouteLoader) : courtes, utiles, une à la fois. */
export const TIPS = [
  "Active les messages privés Discord pour ne jamais rater un check-in.",
  "Le Mode hôte transforme les réglages de la partie privée en liste à cocher.",
  "Un défi officiel par semaine : choisis bien ton adversaire.",
  "Le Classé se joue en solo : ta place, tu la gagnes seul.",
  "« Je suis prêt » se clique aussi depuis le message Discord « Match trouvé ».",
  "Installe l'application pour recevoir les notifications, même site fermé.",
  "Une capture du tableau des scores suffit pour contester un résultat.",
  "N'importe quel joueur de l'équipe peut faire le check-in d'une coupe.",
  "Les maps de chaque mode sont sur la page Map pool.",
  "Ton MVP se vote dans les 24 h après le match.",
];

/** Astuce au hasard (stable pour un même chargement). */
export const randomTip = () => TIPS[Math.floor(Math.random() * TIPS.length)];
