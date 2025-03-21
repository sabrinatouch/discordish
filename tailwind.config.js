/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'discord': {
          'dark': '#202225',
          'darker': '#2f3136',
          'darkest': '#36393f',
          'light': '#dcddde',
          'accent': '#5865f2',
          'accent-hover': '#4752c4',
          'success': '#43b581',
          'danger': '#f04747',
          'warning': '#faa61a',
          'muted': '#72767d',
        }
      },
      fontFamily: {
        'gg-sans': ['gg sans', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '88': '22rem',
        '112': '28rem',
      },
      borderRadius: {
        'discord': '0.25rem',
      },
      boxShadow: {
        'discord': '0 1px 0 rgba(4,4,5,0.2),0 1.5px 0 rgba(6,6,7,0.05),0 2px 0 rgba(4,4,5,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
} 