/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        custom: {
          cream: '#F5E6D3',
          sage: '#9B4DCA',
          charcoal: '#2A2438',
          dark: '#1A1625',
        },
      },
    },
  },
  plugins: [],
};
