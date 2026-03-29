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
          'gray-300': '#B4B4B4',
          'gray-200': '#D4D4D4',
          'gray-100': '#EBEBEB',
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
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      fontSize: {
        'display': ['80px', { lineHeight: '80px', fontWeight: '300' }],
        'title-lg': ['56px', { lineHeight: '56px', fontWeight: '200' }],
        'title-md': ['40px', { lineHeight: '40px', fontWeight: '300' }],
        'title-sm': ['24px', { lineHeight: '31.2px', fontWeight: '300' }],
        'body-lg': ['18px', { lineHeight: '23.4px', fontWeight: '300' }],
        'body-md': ['16px', { lineHeight: '22px', fontWeight: '400' }],
        'label': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'caption': ['12px', { lineHeight: '16.8px', fontWeight: '300' }],
      },
      borderRadius: {
        enter: '8px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
