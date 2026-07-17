import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#201C1F',
          muted: '#6B6568',
          paper: '#F7F7F9',
          surface: '#FFFFFF',
          line: '#DEDEE4',
          red: '#C82828',
          'red-dark': '#A91F26',
          'red-soft': '#F4DDDD',
          wine: '#741533',
          gold: '#D8A45D',
          'cool-soft': '#C8D0E8'
        }
      },
      boxShadow: {
        brand: '0 18px 50px rgba(90, 31, 31, 0.14)'
      }
    }
  },
  plugins: []
} satisfies Config
