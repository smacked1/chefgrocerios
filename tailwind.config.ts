import { type Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './client/index.html',
    './client/src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Text', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        sm: '0.375rem',   // 6px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
        xl: '1rem',       // 16px
        '2xl': '1.5rem',  // 24px
        '3xl': '2rem',    // 32px
      },
      colors: {
        background: '#FDF6F0',
        foreground: '#1A1A1A',
        primary: {
          DEFAULT: '#E95D1F', // Rich orange
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#065F46', // Deep forest green
          foreground: '#FFFFFF',
        },
        muted: '#E2E8F0',
        accent: '#3AB0A2',
        danger: '#FF6B6B',
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0, 0, 0, 0.08)',
        hover: '0 6px 16px rgba(0, 0, 0, 0.12)',
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
