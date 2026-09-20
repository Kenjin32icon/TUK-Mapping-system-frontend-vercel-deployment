/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARY — the ONE brand/action color. Every primary button, active
        // nav state, brand accent and "this is the main thing to do" element
        // uses this. Matches the existing logo teal so no rebrand is needed.
        primary: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669', // default button fill
          700: '#047857', // hover/active
          800: '#065f46',
          900: '#064e3b',
        },
        // INK — dark surfaces (hero cards, action bars). Same values as
        // slate-900/800 today, just named so devs stop reaching for random
        // dark grays.
        ink: {
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0b1220',
        },
        // INFO — for informational badges/banners ONLY (e.g. "Demo mode",
        // chart data series). Never used as a primary-action button fill.
        info: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // WARNING — alerts/required-field notices ONLY. Never used as a
        // "click me to proceed" button fill (that was the bug: Generate Now
        // was amber while Generate Master Profile was emerald for the same
        // action).
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          400: '#fbbf24',
          600: '#d97706',
          700: '#b45309',
        },
        // DANGER — destructive/error states only.
        danger: {
          50:  '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
