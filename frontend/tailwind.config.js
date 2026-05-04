/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#ebe1d8',
          50:  '#faf7f4',
          100: '#f5ede6',
          200: '#ebe1d8',
          300: '#ddd0c4',
          400: '#cebcac',
          500: '#bda594',
        },
        olive: {
          DEFAULT: '#6c8a2c',
          50:  '#f4f7eb',
          100: '#e3eccc',
          200: '#c8d9a0',
          300: '#a9c36d',
          400: '#8cad43',
          500: '#6c8a2c',
          600: '#567022',
          700: '#42551b',
        },
        ivory: {
          DEFAULT: '#fffbe9',
          100: '#fffbe9',
          200: '#fff5c8',
          300: '#ffeda0',
        },
        ink: {
          DEFAULT: '#111111',
          soft:    '#333333',
          muted:   '#666666',
          light:   '#999999',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft':  '0 4px 24px rgba(108, 138, 44, 0.08)',
        'card':  '0 2px 16px rgba(0, 0, 0, 0.06)',
        'hover': '0 8px 32px rgba(108, 138, 44, 0.15)',
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
