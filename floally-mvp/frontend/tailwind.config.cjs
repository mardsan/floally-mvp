/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
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
