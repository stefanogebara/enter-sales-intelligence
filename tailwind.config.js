/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        enter: {
          gold: '#FFAE35',
          'gold-light': '#FFD080',
          'gold-dark': '#E09000',
          black: '#000000',
          'gray-950': '#0A0A0A',
          'gray-900': '#141414',
          'gray-800': '#1C1C1C',
          'gray-700': '#2A2A2A',
          'gray-600': '#3A3A3A',
          'gray-500': '#6B6B6B',
          'gray-400': '#8F8F8F',
          'gray-300': '#B0B0B0',
          'gray-200': '#D4D4D4',
          'gray-100': '#EBEBEB',
          'gray-50': '#F5F5F5',
          white: '#FFFFFF',
        },
        verdict: {
          qualified: '#22C55E',
          'qualified-bg': '#052E16',
          potential: '#FFAE35',
          'potential-bg': '#422006',
          unqualified: '#EF4444',
          'unqualified-bg': '#450A0A',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        enter: '6px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
