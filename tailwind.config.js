/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          pure: '#FFFFFF',
          studio: '#F4F4F2',
          off: '#F9F9F9',
        },
        ink: {
          primary: '#1A1C1C',
          secondary: '#747878',
          border: 'rgba(26, 28, 28, 0.1)',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'subtle': '4px',
      }
    },
  },
  plugins: [],
}