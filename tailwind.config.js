/** @type {import('tailwindcss').Config} */
import scrollbarHide from "tailwind-scrollbar-hide";
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-to-b":
          "linear-gradient(to bottom, rgba(20, 20, 20, 0) 0, rgba(20, 20, 20, 0.15) 15%, rgba(20, 20, 20, 0.35) 29%, rgba(20, 20, 20, 0.58) 44%, #141414 68%, #141414 100%);",
      },
    },
  },

  plugins: [scrollbarHide],
};
