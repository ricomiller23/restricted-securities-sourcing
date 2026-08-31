/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crm: {
          bg: "#07080B",
          sidebar: "#0A0C10",
          card: "#0F1218",
          border: "#1B2030",
          muted: "#8892A6",
          text: "#E8ECF4",
          accent: "#22D3EE",
          gold: "#F59E0B",
          rose: "#FB7185",
          emerald: "#34D399"
        }
      }
    },
  },
  plugins: [],
}
