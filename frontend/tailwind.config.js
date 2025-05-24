module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          dark: '#5A52D9',
          light: '#8A83FF',
        },
        secondary: {
          DEFAULT: '#FF6584',
          dark: '#E54B6B',
          light: '#FF8DA3',
        },
        background: {
          dark: '#1A1A2E',
          light: '#F7F7F7',
        },
        surface: {
          dark: '#16213E',
          light: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#4ECCA3',
          dark: '#3DAA86',
          light: '#6EEDC1',
        },
        text: {
          dark: '#EEEEEE',
          light: '#232931',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'card-dark': '0 4px 6px rgba(0, 0, 0, 0.3)',
        'card-light': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
