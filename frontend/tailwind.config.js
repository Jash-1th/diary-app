/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        love: {
          light: '#fdf2f8', // Rose 50
          primary: '#f43f5e', // Rose 500
          dark: '#be123c', // Rose 700
        }
      }
    },
  },
  plugins: [],
}