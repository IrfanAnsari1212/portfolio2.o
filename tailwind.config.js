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
  // Accent colours are chosen per skill group / certification in content/*.json and
  // composed at build time, so the scanner never sees the finished class name.
  // Add a colour here before using it as an "accent" value.
  safelist: [
    ...['cyan', 'violet', 'emerald', 'amber', 'blue', 'rose'].flatMap((c) => [
      `bg-${c}-500/10`,
      `text-${c}-400`,
      `text-${c}-300`,
      `hover:border-${c}-400/60`,
      `hover:text-${c}-300`,
    ]),
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
