/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans TC',
          'sans-serif',
        ],
      },
      colors: {
        pikmin: {
          red: '#EF4444',
          yellow: '#FBBF24',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          pink: '#EC4899',
          white: '#F3F4F6',
          gray: '#6B7280',
        }
      }
    },
  },
  plugins: [],
}
