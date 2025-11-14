/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#6a1b9a',
          deep: '#4a148c',
          pink: '#ec407a',
          gold: '#ffb300',
          goldLight: '#ffca28',
          orange: '#ff7043',
          orangeLight: '#ff8a65',
          charcoal: '#1a1a1a',
        },
        primary: {
          900: '#6a1b9a',
          800: '#8e24aa',
          700: '#ab47bc',
        },
        accent: {
          300: '#ffb300',
          400: '#ffca28',
        },
        secondary: {
          500: '#ff7043',
          600: '#ff8a65',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 10px 30px rgba(106, 27, 154, 0.25)',
        card: '0 15px 30px rgba(0, 0, 0, 0.08)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #6a1b9a, #ec407a)',
        'gallery-gradient': 'linear-gradient(135deg, #fafaff, #fff8f0)',
      },
    },
  },
  plugins: [],
}

