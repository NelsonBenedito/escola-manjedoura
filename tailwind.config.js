/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spiritual-dark': '#121212',
        'spiritual-olive': '#2D3A30',
        'spiritual-gold': '#C5B358',
        'spiritual-sand': '#E5D3B3',
        'spiritual-white': '#F5F5F5',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'grain': "url('https://www.transparenttextures.com/patterns/60-lines.png')",
      }
    },
  },
  plugins: [],
}
