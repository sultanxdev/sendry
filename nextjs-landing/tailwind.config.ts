import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        card: 'var(--card)',
        ink: 'var(--ink)',
        mute: 'var(--mute)',
        pine: 'var(--pine)',
        pine2: 'var(--pine2)',
        pine3: 'var(--pine3)',
        sig: 'var(--sig)',
        sage: 'var(--sage)',
        line: 'var(--line)',
        unread: 'var(--unread)',
        amber: 'var(--amber)',
        violet: 'var(--violet)',
      },
      fontFamily: {
        display: ['var(--display)', 'sans-serif'],
        body: ['var(--body)', 'sans-serif'],
        mono: ['var(--mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;

