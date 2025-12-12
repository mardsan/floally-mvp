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
        // Hey Aimi "Luminous Calm" Design System
        
        // Primary Palette (Foundation) - Use everywhere
        'aimi-green': '#65E6CF',      // Primary brand color, glow, presence
        'deep-slate': '#183A3A',      // Text, structure, grounding
        'soft-ivory': '#F6F8F7',      // Main backgrounds
        'mist-grey': '#E6ECEA',       // Dividers, subtle surfaces
        
        // Emotional Spectrum (Whisper, not shout)
        'aurora-blue': '#3DC8F6',     // Focus / thinking
        'glow-coral': '#FF7C72',      // Encouragement / warmth (not red!)
        'lumo-violet': '#AE7BFF',     // Insight / creativity
        'sunlight-amber': '#FFC46B',  // Completion / success
        
        // Dark Mode (Nighttime Calm)
        'dark-bg': '#0F2A2A',
        'dark-card': '#143636',
        'dark-text': '#DCEEEE',
        
        // Semantic aliases for clarity
        'primary': '#65E6CF',
        'primary-hover': '#7EEBD9',
        'text-primary': '#183A3A',
        'text-secondary': '#506968',
        'bg-main': '#F6F8F7',
        'bg-card': '#FFFFFF',
        'border-subtle': '#E6ECEA',
        
        // State colors (calm, not aggressive)
        'success': '#FFC46B',         // Warm amber, not green
        'error': '#FF7C72',           // Soft coral, not red
        'warning': '#FFC46B',         // Sunlight amber
        'info': '#3DC8F6',            // Aurora blue
      },
      fontFamily: {
        // Soft, clear, human typography
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'display': ['Sofia Sans', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Calm, measured hierarchy - Aimi speaks in breathable phrases
        'tiny': ['0.75rem', { lineHeight: '1.125rem' }],     // 12px - Metadata
        'small': ['0.875rem', { lineHeight: '1.375rem' }],   // 14px - Secondary text
        'base': ['1rem', { lineHeight: '1.5rem' }],          // 16px - Body
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],       // 18px
        'xl': ['1.25rem', { lineHeight: '1.875rem' }],       // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],           // 24px - H3
        '3xl': ['2rem', { lineHeight: '2.5rem' }],           // 32px - H2
        '4xl': ['2.5rem', { lineHeight: '3rem' }],           // 40px - H1
        '5xl': ['3.5rem', { lineHeight: '4rem' }],           // 56px - Hero
        // Legacy sizes for compatibility
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      },
      spacing: {
        '18': '4.5rem',
      boxShadow: {
        // Gentle depth, no harsh edges
        'soft': '0 2px 8px rgba(24, 58, 58, 0.06)',          // Default card shadow
        'soft-md': '0 4px 16px rgba(24, 58, 58, 0.08)',      // Elevated cards
        'soft-lg': '0 8px 24px rgba(24, 58, 58, 0.10)',      // Modals, overlays
        'glow': '0 0 20px rgba(101, 230, 207, 0.3)',         // Aimi's breathing glow
        'glow-strong': '0 0 30px rgba(101, 230, 207, 0.5)',  // Active state
        'glow-subtle': '0 0 12px rgba(101, 230, 207, 0.2)',  // Idle state
        // Legacy for compatibility
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 2px 8px rgba(24, 58, 58, 0.06)',
        'md': '0 4px 16px rgba(24, 58, 58, 0.08)',
        'lg': '0 8px 24px rgba(24, 58, 58, 0.10)',
        'xl': '0 12px 32px rgba(24, 58, 58, 0.12)',
        'none': 'none',
      },
      borderRadius: {
        // Soft, approachable curves (12-20px range)
        'sm': '0.5rem',    // 8px
        'DEFAULT': '0.75rem',  // 12px - Standard
        'md': '1rem',      // 16px - Cards, buttons (most common)
        'lg': '1.25rem',   // 20px - Large cards
        'xl': '1.5rem',    // 24px - Hero sections
      animation: {
        // Breathing, not beeping - slow, organic, calm
        'breathe': 'breathe 2000ms ease-in-out infinite',           // Idle state
        'breathe-slow': 'breathe 3000ms ease-in-out infinite',      // Very calm
        'pulse-calm': 'pulseCalmGlow 2000ms ease-in-out infinite',  // Aimi's glow
        'thinking': 'thinking 600ms ease-in-out',                   // Processing
        'listening': 'listening 400ms ease-out',                    // Attention
        'success': 'success 400ms ease-out',                        // Celebration
        'fade-in': 'fadeIn 500ms ease-in-out',                      // Appear
        'slide-up': 'slideUp 500ms ease-out',                       // Enter from below
        'slide-down': 'slideDown 300ms ease-out',                   // Soft dimming
        'scale-in': 'scaleIn 300ms ease-out',                       // Pop in
        'float': 'float 3000ms ease-in-out infinite',               // Gentle drift
        // Legacy
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        // Aimi's breathing animation (idle)
        breathe: {
          '0%, 100%': { 
            opacity: '0.85',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.02)',
          },
        },
        // Calm pulsing glow
        pulseCalmGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 12px rgba(101, 230, 207, 0.2)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(101, 230, 207, 0.35)',
          },
        },
      backgroundImage: {
        // Luminous gradients (use sparingly)
        'aimi-glow': 'linear-gradient(135deg, #65E6CF 0%, #3DC8F6 100%)',
        'aimi-soft': 'linear-gradient(135deg, #F6F8F7 0%, #E6ECEA 100%)',
        'aimi-dark': 'linear-gradient(135deg, #143636 0%, #0F2A2A 100%)',
        'success-glow': 'linear-gradient(135deg, #FFC46B 0%, #FFE5A8 100%)',
        'thinking-glow': 'linear-gradient(135deg, #3DC8F6 0%, #AE7BFF 100%)',
        // Standard
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },  },
          '50%': { 
            opacity: '1',
            transform: 'rotate(2deg) scale(1.01)',
          },
          '100%': { 
            opacity: '1',
            transform: 'rotate(0deg) scale(1)',
          },
        },
        // Listening state (expansion)
        listening: {
          '0%': { 
            transform: 'scale(1)',
            boxShadow: '0 0 12px rgba(101, 230, 207, 0.2)',
          },
          '100%': { 
            transform: 'scale(1.03)',
            boxShadow: '0 0 24px rgba(101, 230, 207, 0.4)',
          },
        },
        // Success state (warm glow + lift)
        success: {
          '0%': { 
            transform: 'translateY(0) scale(1)',
            boxShadow: '0 2px 8px rgba(24, 58, 58, 0.06)',
          },
          '50%': { 
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: '0 8px 24px rgba(255, 196, 107, 0.3)',
          },
          '100%': { 
            transform: 'translateY(0) scale(1)',
            boxShadow: '0 2px 8px rgba(24, 58, 58, 0.06)',
          },
        },
        // Standard transitions
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      transitionDuration: {
        'calm': '500ms',      // Standard calm transition
        'breathe': '2000ms',  // Breathing animations
        'quick': '300ms',     // Quick feedback
      },
      transitionTimingFunction: {
        'calm': 'cubic-bezier(0.4, 0, 0.2, 1)',  // Smooth ease-in-out
      },scaleIn: {
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
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
