/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0a0b0d',
          900: '#101216',
          850: '#15181d',
          800: '#1b1f25',
          700: '#262b33',
          600: '#363c46',
          500: '#5a626e',
          400: '#8b929c',
          300: '#b6bcc4',
          200: '#dadde2',
          100: '#eef0f3',
        },
        neon: {
          green: '#39ff8a',
          greenDim: '#27c66b',
          blue: '#3ad6ff',
          blueDim: '#1ea8cc',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(57,255,138,0.35), 0 8px 30px -10px rgba(57,255,138,0.45)',
        glowBlue: '0 0 0 1px rgba(58,214,255,0.35), 0 8px 30px -10px rgba(58,214,255,0.45)',
      },
    },
  },
  plugins: [],
};
