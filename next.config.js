/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Anciennes adresses du site → nouvelles pages (les liens déjà partagés continuent de marcher).
  async redirects() {
    return [
      { source: "/accueil", destination: "/", permanent: false },
      { source: "/ranked", destination: "/cod/ranked", permanent: false },
      { source: "/queue", destination: "/cod/ranked", permanent: false },
      { source: "/profile", destination: "/cod/profile", permanent: false },
      { source: "/profil", destination: "/cod/profile", permanent: false },
      // Liens d'invitation : une seule forme, /invite/equipe/CODE et /invite/groupe/CODE.
      { source: "/cod/equipes/rejoindre/:code", destination: "/invite/equipe/:code", permanent: true },
      { source: "/cod/groupe/:code", destination: "/invite/groupe/:code", permanent: true },
    ];
  },

  // En-têtes de sécurité sur toutes les pages. Le site n'est lu par aucun autre site :
  // pas d'en-têtes CORS ici (c'est le backend qui autorise le site à l'appeler).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Interdit d'afficher le site dans une page tierce (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
