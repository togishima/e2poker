import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6264ed',
          glow: 'rgba(99, 102, 241, 0.3)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
