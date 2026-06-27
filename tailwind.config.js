/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sog: {
          green: "#00ff66",
          dark: "#001100",
          glow: "rgba(0,255,100,0.4)",
        },
      },
      fontFamily: {
        sog: ["'Share Tech Mono'", "monospace"],
      },
      boxShadow: {
        sog: "0 0 12px rgba(0,255,80,0.4)",
      },
    },
  },
  plugins: [],
};
