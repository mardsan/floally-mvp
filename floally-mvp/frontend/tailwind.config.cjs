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
        // Luminous Calm - Primary Palette
        'aimi-green': '#65E6CF',     // Primary brand - calm, luminous
        'deep-slate': '#183A3A',     // Text, structure
        'soft-ivory': '#F6F8F7',     // Main background
        'mist-grey': '#E6ECEA',      // Dividers, subtle surfaces
        
        // Emotional Spectrum (use sparingly)
        'aurora-blue': '#3DC8F6',    // Focus, thinking
        'glow-coral': '#FF7C72',     // Encouragement, warmth
        'lumo-violet': '#AE7BFF',    // Insight, creativity
        'sunlight-amber': '#FFC46B', // Completion, success
        
        // Semantic aliases
        'primary': '#65E6CF',
        'primary-dark': '#23c4b0',
        'primary-light': '#ccfbf4',
        'accent': '#3DC8F6',
        'coral': '#FF7C72',
        
        // Legacy support (backward compatibility)
        'aimi': {
          'lumo-green': {
            300: '#65E6CF',
            500: '#23c4b0',
            100: '#ccfbf4',
          },
          'aurora-blue': { 300: '#3DC8F6' },
          'glow-coral': { 300: '#FF7C72' },
          'deep-slate': { 800: '#183A3A' },
          'soft-ivory': { 50: '#F6F8F7' },
        },
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
        'breathe': 'breathe 2s ease-in-out infinite',
        'pulse-calm': 'pulseCam 3s ease-in-out infinite',
        'thinking': 'thinking 1.5s ease-in-out infinite',
        'listening': 'listening 2s ease-in-out infinite',
        'success': 'success 0.6s ease-out',
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
        breathe: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        pulseCam: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        thinking: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(5deg) scale(1.1)' },
        },
        listening: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(101, 230, 207, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(101, 230, 207, 0)' },
        },
        success: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
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
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
