import next from "eslint-config-next";

// npm run lint : une erreur bloque la vérification, un avertissement reste à reprendre au fil de l'eau.
const config = [
  ...next,
  { ignores: ["src/pages/dev-*.js", ".next/**", "public/**"] },
  {
    // Motifs déjà répandus dans le site, sans bug connu : signalés sans bloquer.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  {
    // Images générées côté serveur : next/image et alt n'y ont pas de sens.
    files: ["src/pages/api/og/**"],
    rules: { "@next/next/no-img-element": "off", "jsx-a11y/alt-text": "off" },
  },
];

export default config;
