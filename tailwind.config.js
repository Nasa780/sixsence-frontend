/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
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
