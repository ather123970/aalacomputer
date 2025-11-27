import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1766FF',
          dark: '#0D4FCC',
          light: '#4A8AFF',
        },
        accent: {
          DEFAULT: '#7B5CFF',
          dark: '#5E3FCC',
          light: '#9B7FFF',
        },
        dark: {
          DEFAULT: '#0b0b0f',
          indigo: '#161625',
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(180deg, #0b0b0f 0%, #161625 100%)',
        'gradient-blue': 'linear-gradient(135deg, #1766FF 0%, #7B5CFF 100%)',
      },
      borderRadius: {
        'button': '12px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(23, 102, 255, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(123, 92, 255, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
