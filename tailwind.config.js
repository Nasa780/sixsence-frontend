/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.{js,ts,jsx,tsx}"
  ],

  theme: {
    screens: {
      /* -------------------- MOBILE -------------------- */
      mq359: { raw: "screen and (max-width: 359px)" },
      mq414: { raw: "screen and (max-width: 414px)" },
      mq450: { raw: "screen and (max-width: 450px)" },

      /* -------------------- MOBILE LARGE (NOUVEAU) -------------------- */
      mq750: { raw: "screen and (max-width: 750px)" },

      /* -------------------- TABLETTE -------------------- */
      mq451_675: { raw: "screen and (min-width: 451px) and (max-width: 675px)" },

      /* -------------------- PETIT LAPTOP -------------------- */
      mq676_750: { raw: "screen and (min-width: 676px) and (max-width: 750px)" },

      /* -------------------- LAPTOP MOYEN -------------------- */
      mq751_800: { raw: "screen and (min-width: 751px) and (max-width: 800px)" },

      /* -------------------- DESKTOP LARGE (NOUVEAU) -------------------- */
      lg: { raw: "screen and (min-width: 751px) and (max-width: 1200px)" },
    },
  },

  corePlugins: {
    preflight: false,
  },
};
