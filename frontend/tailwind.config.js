/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          500: '#2a3340',
          600: '#1f2937',
          700: '#111827',
          800: '#0b0f17',
          900: '#070a10',
          950: '#04060a',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Sarabun', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glow: '0 0 24px rgba(16, 185, 129, 0.35)',
        'glow-lg': '0 0 40px rgba(16, 185, 129, 0.45)',
        soft: '0 10px 40px -15px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
