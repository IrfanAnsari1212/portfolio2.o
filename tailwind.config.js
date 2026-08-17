/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './assets/main.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  // These classes only ever appear inside main.js (toggled at runtime), so the
  // content scanner cannot see them. Without this they'd be stripped from the build.
  safelist: [
    'bg-[#0b1120]/90',
    'backdrop-blur',
    'border-slate-800',
    'opacity-0',
    'pointer-events-none',
    'hidden',
    'text-emerald-400',
    'text-red-400',
    'text-slate-400',
    'text-xs',
    'text-center',
    'min-h-[1rem]',
    'w-4',
    'h-4',
  ],
  plugins: [],
};
