/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0b1329',
          navyLight: '#16203d',
          navyLighter: '#222f54',
          gold: '#eab308',
          goldLight: '#fde047',
          goldDark: '#ca8a04',
          maroon: '#881337',
          amber: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

