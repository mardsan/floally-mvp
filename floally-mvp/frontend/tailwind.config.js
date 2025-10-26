/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'opally': {
          'mint': '#dafef4',
          'mint-dark': '#b8f5e8',
          'mint-light': '#e8fef9',
        }
      }
    },
  },
  plugins: [],
}
