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
          yellow: '#FFC72C', // Uber/Rapido yellow
          dark: '#0B0F19',   // sleek charcoal background
          slate: '#1E293B',  // slate grey
          indigo: '#6366F1', // indigo accent
          teal: '#14B8A6'    // teal secondary
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
