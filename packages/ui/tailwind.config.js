/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../../apps/web/src/**/*.{js,ts,jsx,tsx}",
    "../../apps/miniprogram/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          dark: '#0c0d14',
          card: '#13141f',
          accent: '#f43f5e',
        }
      },
    },
  },
  plugins: [],
}
