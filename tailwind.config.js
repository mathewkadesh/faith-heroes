/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0505',
        card: '#180C0C',
        'card-hover': '#1F0E0E',
        accent: '#8B1A1A',
        'accent-light': '#E05555',
        gold: '#C9A84C',
        'gold-light': '#E8C76A',
        cream: '#FDF5F0',
        'dark-text': '#2A1010',
        muted: '#9E7070',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
