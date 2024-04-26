/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    borderRadius: {
      sm: '3px',
      xl: '9px',
      full: '100%',
    },
  },
  plugins: [],
};
