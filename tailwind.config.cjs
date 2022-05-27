const colors = require("tailwindcss/colors");

/**
 * @type {import('tailwindcss/tailwind-config').TailwindConfig}
 */
module.exports = {
  content: ["frontend/**/*.{ts,tsx,js,jsx}"],
  theme: {
    colors: {
      primary: {
        DEFAULT: "#2a467b",
      },
      white: colors.white,
      lightGray: colors.lightGray,
      coolGray: colors.gray,
      blue: colors.blue,
      red: colors.red,
      transparent: "transparent",
    },
    extend: {
      outline: {
        primary: ["2px solid #2a467b"],
      },
    },
  },
};
