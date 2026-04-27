/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rugby: {
          green:     '#2D6A4F',
          darkgreen: '#1B4332',
          gold:      '#D4AF37',
          lightgold: '#F0D060',
          pitch:     '#52B788',
        },
        sra: {
          red:   '#E8172C',
          dark:  '#0D0D14',
          card:  '#12121F',
          border:'#1E1E32',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
