/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0eeff',
          100: '#e0ddff',
          200: '#c4beff',
          300: '#a69eff',
          400: '#8a7eff',
          500: '#6C63FF',
          600: '#5a52d5',
          700: '#4741ab',
          800: '#343081',
          900: '#221f57',
        },
        dark: {
          bg: '#1A1A2E',
          surface: '#16213E',
          border: '#0F3460',
          text: '#E0E0E0',
        },
        light: {
          bg: '#F5F0FF',
          surface: '#FFFFFF',
          border: '#E5E7EB',
          text: '#1A1A2E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateY(-10px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
