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
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://sixsence-backend.onrender.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
