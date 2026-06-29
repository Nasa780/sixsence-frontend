/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#05060a",
        accent: "#FFA800",
        accentDark: "#CC8600",
        whiteDim: "rgba(255,255,255,0.45)",
        whiteSoft: "rgba(175,175,200,0.6)",
      },
      fontFamily: {
        raj: ["Rajdhani", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      letterSpacing: {
        hero: "3.36px",
        sub: "8.1536px",
        small: "2.464px",
      },
      backgroundImage: {
        heroText:
          "linear-gradient(170deg,#FFFFFF 6.17%,#FFFFFF 41.23%,#FFA800 71.91%,#CC8600 93.83%)",
      },
      boxShadow: {
        accent: "0px 0px 14px rgba(255,168,0,0.32)",
      },
    },
  },
  plugins: [],
};
