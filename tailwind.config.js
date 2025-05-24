/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ZAM Tech Noir Color Palette
        'zam-bg': {
          primary: '#0f0f0f',
          secondary: '#1a1a1a',
          tertiary: '#252525',
          card: '#1f1f1f',
          hover: '#2a2a2a',
        },
        'zam-accent': {
          primary: '#00ffcc',
          secondary: '#ff0066',
          tertiary: '#ffcc00',
          info: '#00ccff',
          success: '#00ff66',
          warning: '#ff9900',
          danger: '#ff3333',
        },
        'zam-text': {
          primary: '#ffffff',
          secondary: '#b3b3b3',
          tertiary: '#808080',
          muted: '#666666',
        },
        'zam-border': {
          primary: '#333333',
          secondary: '#404040',
          accent: '#00ffcc33',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 204, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 204, 0.8)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'zam': '0 4px 6px -1px rgba(0, 255, 204, 0.1), 0 2px 4px -1px rgba(0, 255, 204, 0.06)',
        'zam-lg': '0 10px 15px -3px rgba(0, 255, 204, 0.1), 0 4px 6px -2px rgba(0, 255, 204, 0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}