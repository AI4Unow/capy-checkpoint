/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: '#FFD6E0',
        sage: '#DDE5B6',
        cream: '#FEFAE0',
        sky: '#A2D2FF',
        text: '#5E503F',
        red: '#FF4D6D',
        yellow: '#FFD60A',
      },
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        baloo: ['"Baloo 2"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
