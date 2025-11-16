/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1a1a1a',
        'dark-panel': '#2a2a2a',
        'dark-card': '#3a3a3a',
      },
    },
  },
  plugins: [],
}

