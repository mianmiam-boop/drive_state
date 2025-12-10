/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 启用 class 模式的暗黑主题
  theme: {
    extend: {
      colors: {
        // 自定义颜色
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      backgroundColor: {
        'dark-primary': '#0f1419',
        'dark-secondary': '#1a1f2e',
        'dark-card': '#12171f',
      },
      borderColor: {
        'dark-border': '#2d3748',
      },
    },
  },
  plugins: [],
}