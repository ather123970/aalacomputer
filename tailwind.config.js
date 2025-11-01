/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        moveX: {
          '0%': { transform: 'translateX(-20%) translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateX(120%) translateY(-10px) rotate(3deg)' },
          '100%': { transform: 'translateX(-20%) translateY(0) rotate(0deg)' },
        },
      },
      animation: {
        moveX: 'moveX 6s linear infinite',
      },
    },
  },
  plugins: [],
}
