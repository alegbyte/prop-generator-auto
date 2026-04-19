/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1a1f36',
          light: '#2d3561',
        },
      },
    },
  },
  plugins: [],
};
