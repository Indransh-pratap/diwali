export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#080414',
        plum: '#160829',
        royal: '#240a3d',
        maroon: '#4a1226',
        gold: '#e6c887',
        'gold-warm': '#d4af37',
        'gold-light': '#f5e4be',
        rose: '#f29bb2',
        'rose-deep': '#e06b8b',
        amber: '#ff9e3b',
        'amber-warm': '#ffb84d',
        cream: '#faf4ea',
        ivory: '#f3e6d0',
      },
      fontFamily: {
        script: ['"Great Vibes"', 'cursive'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        royal: ['Cinzel', 'serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 90s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite alternate',
        'float-slow': 'floatSlow 6s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseSubtle: {
          '0%': { opacity: '0.6', transform: 'scale(0.99)' },
          '100%': { opacity: '0.9', transform: 'scale(1.01)' },
        },
        floatSlow: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
