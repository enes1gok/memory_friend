/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#07070f',
        background: '#07070f',
        surface: '#0f0f1a',
        surfaceElevated: '#151528',
        primary: '#f5f5f5',
        secondary: '#c8c8d8',
        muted: '#8888a0',
        accentBlue: '#3b82f6',
        accentOrange: '#f97316',
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
      },
    },
  },
  plugins: [],
};
