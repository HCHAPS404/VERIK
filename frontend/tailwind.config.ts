import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gov: {
          primary: "var(--color-gov-primary)",
          secondary: "var(--color-gov-secondary)",
          surface: "var(--color-gov-surface)",
          foreground: "var(--color-gov-foreground)",
          muted: "var(--color-gov-muted)",
          border: "var(--color-gov-border)"
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)"
      },
      borderRadius: {
        md: "var(--radius-md)",
        lg: "var(--radius-lg)"
      },
      fontFamily: {
        sans: "var(--font-sans)"
      }
    }
  },
  plugins: []
};

export default config;
