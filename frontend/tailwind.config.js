/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Geist', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a' },
      },
      boxShadow: {
        'card':  '0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.06)',
        'card-h':'0 8px 40px rgba(37,99,235,.12),0 2px 8px rgba(0,0,0,.06)',
        'glow':  '0 0 30px rgba(37,99,235,.25)',
        'blue':  '0 4px 24px rgba(37,99,235,.35)',
      },
    },
  },
  plugins: [],
};
