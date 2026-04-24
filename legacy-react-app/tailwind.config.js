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
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c0d1ff',
          400: '#7c96ff',
          500: '#4f6ef7',   // primary action
          600: '#3a55e0',
          800: '#1e2f8a',
          900: '#111a5c',
        },
        cluster: {
          violet:  { bg: '#f5f3ff', border: '#8b5cf6', text: '#4c1d95', dot: '#7c3aed' },
          teal:    { bg: '#f0fdf9', border: '#14b8a6', text: '#134e4a', dot: '#0d9488' },
          coral:   { bg: '#fff7ed', border: '#fb923c', text: '#7c2d12', dot: '#ea580c' },
          rose:    { bg: '#fff1f2', border: '#fb7185', text: '#881337', dot: '#e11d48' },
          amber:   { bg: '#fffbeb', border: '#fbbf24', text: '#78350f', dot: '#d97706' },
          sky:     { bg: '#f0f9ff', border: '#38bdf8', text: '#0c4a6e', dot: '#0284c7' },
          lime:    { bg: '#f7fee7', border: '#84cc16', text: '#365314', dot: '#65a30d' },
          pink:    { bg: '#fdf4ff', border: '#e879f9', text: '#701a75', dot: '#c026d3' },
        },
        positive: '#16a34a',
        negative: '#dc2626',
        neutral:  '#94a3b8',
        canvas:   '#f0f2f7',
      },
      keyframes: {
        fadeSlideIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      },
      animation: {
        fadeSlideIn: 'fadeSlideIn 0.25s ease forwards',
        slowPulse: 'pulse 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
