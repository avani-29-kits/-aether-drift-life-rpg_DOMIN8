/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0b0a1a',
        abyss: '#12102a',
        panel: '#181433',
        glimmer: '#f4c95d',
        arcane: '#8b5cf6',
        ember: '#f4623a',
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(139, 92, 246, 0.45)',
        goldGlow: '0 0 18px rgba(244, 201, 93, 0.4)',
      },
    },
  },
  plugins: [],
};
