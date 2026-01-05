/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  // Ensure utilities referenced via @apply are available during JIT
  safelist: [
    'bg-blue-600', 'hover:bg-blue-700', 'text-white', 'font-medium', 'py-2', 'px-4', 'rounded-lg', 'transition-colors', 'duration-200',
    'bg-gray-200', 'hover:bg-gray-300', 'text-gray-800',
    'bg-white', 'rounded-lg', 'shadow-sm', 'border', 'border-gray-200', 'p-6',
    'w-full', 'px-3', 'py-2', 'border-gray-300', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent',
    'dark:bg-slate-800', 'dark:text-white', 'dark:border-slate-700'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}