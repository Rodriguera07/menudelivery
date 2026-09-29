import type { Config } from 'tailwindcss';

// Design tokens carried over from the CardápioZap prototype (iFood-style theme)
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F5F5F7',
        surface: '#FFFFFF',
        surface2: '#F1F1F4',
        line: '#EAEAEE',
        line2: '#DEDEE4',
        ink: '#1C1C21',
        muted: '#6E6E77',
        dim: '#A3A3AC',
        brand: { DEFAULT: '#EA1D2C', dark: '#C4121F', soft: '#FDE8E9' },
        orange: { DEFAULT: '#FF8A00', soft: '#FFEEDB' },
        green: { DEFAULT: '#2FA84F', soft: '#E4F6E9' },
        blue: { DEFAULT: '#2E7BE0', soft: '#E7F0FD' },
        wa: '#25D366',
      },
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
