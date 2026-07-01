module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    screens: {
      // Mobile
      mq359: { raw: "screen and (max-width: 359px)" },
      mq414: { raw: "screen and (max-width: 414px)" },
      mq450: { raw: "screen and (max-width: 450px)" },

      // Tablette
      mq451_675: { raw: "screen and (min-width: 451px) and (max-width: 675px)" },

      // Petit laptop
      mq676_750: { raw: "screen and (min-width: 676px) and (max-width: 750px)" },

      // Laptop moyen
      mq751_800: { raw: "screen and (min-width: 751px) and (max-width: 800px)" },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
