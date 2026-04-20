/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme (default)
        background: '#0f0f0f',
        backgroundElevated: '#121212',
        surface: '#1a1a1a',
        border: '#2a2a2a',
        textMain: '#e5e5e5',
        textDark: '#e5e5e5',
        textMuted: '#a3a3a3',
        primary: '#121212',
        primaryDark: '#0a0a0a',
        secondary: '#3b82f6',
        secondaryHover: '#2563eb',
        // Light theme
        light: {
          bg: '#f5f5f5',
          bgElevated: '#ffffff',
          surface: '#ffffff',
          border: '#e0e0e0',
          textMain: '#1a1a1a',
          textDark: '#1a1a1a',
          textMuted: '#737373',
          primary: '#1e40af',
          primaryDark: '#1e3a8a',
        },
        // Dark theme (explicit)
        dark: {
          bg: '#0f0f0f',
          bgElevated: '#121212',
          surface: '#1a1a1a',
          border: '#2a2a2a',
          textMain: '#e5e5e5',
          textDark: '#e5e5e5',
          textMuted: '#a3a3a3',
          primary: '#121212',
          primaryDark: '#0a0a0a',
        },
      },
      borderRadius: {
        none: '0',
        DEFAULT: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '0',
      },
    },
  },
  plugins: [],
};
