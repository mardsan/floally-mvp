/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
    },
    extend: {
      colors: {
        // Legacy colors (keeping for backwards compatibility)
        'opally': {
          'mint': '#dafef4',
          'mint-dark': '#b8f5e8',
          'mint-light': '#e8fef9',
        },
        // Hey Aimi LUMO Brand Colors
        'aimi': {
          // LUMO Green - Primary
          'lumo-green': {
            50: '#f0fdfb',
            100: '#ccfbf4',
            200: '#99f6ea',
            300: '#65E6CF',  // Primary LUMO Green
            400: '#3dd5bf',
            500: '#23c4b0',
            600: '#1a9d8f',
            700: '#177e73',
            800: '#14635c',
            900: '#12514c',
          },
          // Aurora Blue - Secondary
          'aurora-blue': {
            50: '#f0fbff',
            100: '#e0f6ff',
            200: '#b9edff',
            300: '#3DC8F6',  // Aurora Blue
            400: '#29b6e3',
            500: '#1a9dca',
            600: '#147ea6',
            700: '#116586',
            800: '#0f526e',
            900: '#0d435b',
          },
          // Glow Coral - Accent
          'glow-coral': {
            50: '#fff4f2',
            100: '#ffe8e5',
            200: '#ffc9c3',
            300: '#FF7C72',  // Glow Coral
            400: '#ff5b50',
            500: '#f24438',
            600: '#d93025',
            700: '#b72520',
            800: '#97201d',
            900: '#7d1e1c',
          },
          // Deep Slate - Dark
          'deep-slate': {
            50: '#f5f8f7',
            100: '#e6eded',
            200: '#d0dbda',
            300: '#adbdbc',
            400: '#819d9c',
            500: '#638281',
            600: '#506968',
            700: '#435656',
            800: '#183A3A',  // Deep Slate
            900: '#142e2e',
          },
          // Soft Ivory - Light
          'soft-ivory': {
            50: '#F6F8F7',  // Soft Ivory
            100: '#f1f4f3',
            200: '#e5ebe9',
            300: '#d3dcd9',
            400: '#b9c6c3',
            500: '#9dadaa',
            600: '#7f8f8c',
            700: '#677572',
            800: '#56615f',
            900: '#495350',
          },
        },
        // Quick aliases for common uses
        'primary': '#65E6CF',       // LUMO Green
        'primary-dark': '#23c4b0',  // LUMO Green 500
        'primary-light': '#ccfbf4', // LUMO Green 100
        'accent': '#3DC8F6',        // Aurora Blue
        'coral': '#FF7C72',         // Glow Coral
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.16' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.05' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px rgba(20, 184, 166, 0.3)',
        'glow-lg': '0 0 40px rgba(20, 184, 166, 0.4)',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'aimi-gradient': 'linear-gradient(135deg, #65E6CF 0%, #3DC8F6 100%)',
        'aimi-gradient-soft': 'linear-gradient(135deg, #F6F8F7 0%, #ccfbf4 100%)',
      },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
