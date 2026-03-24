import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "oe-deep-space": "#0A0F1F",
        "oe-aurora-violet": "#7C5CFF",
        "oe-solar-gold": "#F6C453",
        "oe-spirit-cyan": "#54E2E9",
        "oe-pure-light": "#F7F8FB",
      },
    },
  },
  plugins: [],
};
export default config;
