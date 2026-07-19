import type { Config } from 'tailwindcss'

// Paleta v3 "ficha de cantina" (docs/design-v2.md §Tokens): 5 tons com papéis
// claros. Os nomes legados (wine, gold, cool-soft) são mantidos como aliases
// para os componentes existentes, apontando para os tons novos.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#231F1C',
          muted: '#7A736C',
          paper: '#FCFBF7',
          surface: '#FFFFFF',
          line: '#E7E2DA',
          red: '#C82828',
          'red-dark': '#A61F1F',
          'red-soft': '#F6E7E2',
          green: '#2F5D50',
          // aliases legados → tons v3
          wine: '#2F5D50',
          gold: '#A8842C',
          'cool-soft': '#E9F0EC'
        }
      },
      fontFamily: {
        display: ['Bricolage', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        brand: '0 1px 2px rgba(35, 31, 28, 0.06)'
      }
    }
  },
  plugins: []
} satisfies Config
