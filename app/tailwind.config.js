/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom Growth Summit Colors - Revamped
        brand: {
          blue: '#162636',
          yellow: '#f1bb14',
          gray: '#5e5e5e',
          light: '#eeeeee',
          white: '#ffffff',
        },
        // Aliases for compatibility with old code
        teal: {
          DEFAULT: '#162636',
          50: '#f0f5f9',
          100: '#e1ebf2',
          200: '#c3d7e5',
          300: '#a5c3d8',
          400: '#162636',
          500: '#162636',
          600: '#12202d',
          700: '#0e1a24',
          800: '#0a141b',
          900: '#060a0d',
        },
        orange: {
          DEFAULT: '#f1bb14',
          50: '#fef8e3',
          100: '#fdf1b8',
          200: '#fce37d',
          300: '#fad542',
          400: '#f1bb14',
          500: '#f1bb14',
          600: '#d1a311',
          700: '#b18a0e',
          800: '#91710b',
          900: '#715808',
        },
        dark: {
          DEFAULT: '#0A0A0A',
          100: '#162636', // Using Brand Blue as dark-100
          200: '#141414',
          300: '#2A2A2A',
          400: '#3A3A3A',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        glow: "0 0 20px rgba(33, 128, 141, 0.5)",
        "glow-orange": "0 0 20px rgba(254, 76, 56, 0.5)",
        subtle: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        medium: "0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)",
        heavy: "0 10px 40px rgba(0,0,0,0.16)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-sm': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(33, 128, 141, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(33, 128, 141, 0.6)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "count-up": "count-up 0.5s ease-out forwards",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
