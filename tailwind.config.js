import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      borderRadius: { inherit: 'inherit' },
      boxShadow: { card: '0 2px 4px -1px rgb(0 0 0 / 0.06), 0 4px 6px -1px rgb(0 0 0 / 0.05)' },
      transitionTimingFunction: { 'in-out-soft': 'cubic-bezier(.4,0,.2,1)' },
    },
  },
  plugins: [typography, forms],
};
