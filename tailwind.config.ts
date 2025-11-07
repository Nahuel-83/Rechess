import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        chessLight: '#f0d9b5',
        chessDark: '#b58863',
        primary: '#3b82f6',
        accent: '#8b5cf6',
      },
    },
  },
  plugins: [],
}

export default config