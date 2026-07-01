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
      mq414: {
        raw: "screen and (max-width: 414px)",
      },
      mq450: {
        raw: "screen and (max-width: 450px)",
      },

      // 451 → 750
      mq750_low: {
        raw: "screen and (min-width: 451px) and (max-width: 750px)",
      },

      mq359: {
        raw: "screen and (max-width: 359px)",
      },
      mq675: {
        raw: "screen and (max-width: 675px)",
      },

      // 676 → 750
      mq750_high: {
        raw: "screen and (min-width: 676px) and (max-width: 750px)",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
