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
    },
  },
  corePlugins: {
    preflight: false,
  },
};
