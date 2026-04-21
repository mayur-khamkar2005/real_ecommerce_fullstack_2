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
        // Theme-aware tokens (read from CSS variables)
        background: 'var(--bg)',
        backgroundElevated: 'var(--bg-elevated)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        textMain: 'var(--text-main)',
        textDark: 'var(--text-dark)',
        textMuted: 'var(--text-muted)',
        primary: 'var(--primary)',
        primaryDark: 'var(--primary-dark)',
        secondary: 'var(--secondary)',
        secondaryHover: 'var(--secondary-hover)',
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
