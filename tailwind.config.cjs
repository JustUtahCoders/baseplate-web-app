const colors = require("tailwindcss/colors");

/**
 * @type {import('tailwindcss/tailwind-config').TailwindConfig}
 */
module.exports = {
  content: ["frontend/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2a467b",
        },
      },
      outline: {
        primary: ["2px solid #2a467b"],
      },
    },
  },
  safelist: [
    `ml-14`,
    `ml-40`,
    `lg:w-14`,
    `lg:w-40`,
    `lg:ml-14`,
    `lg:ml-40`,
    "bg-gray-100",
  ],
};
