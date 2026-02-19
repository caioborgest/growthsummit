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
        // Growth Experience Brand Colors - Paleta Oficial
        brand: {
          // Cores Primárias
          'orange-coral': '#ff7043',      // Laranja Coral - Cor principal da marca
          'orange-gradient': '#ff8549',   // Laranja Gradiente - Para degradês
          'orange-intense': '#ff4035',    // Laranja Intenso - Destaques e CTAs

          // Cores Neutras
          'gray-light': '#E6E6E6',        // Cinza Claro - "EXPERIENCE" e elementos suaves
          'gray-medium': '#999999',       // Cinza Médio - Texto secundário
          'gray-dark': '#333333',         // Cinza Escuro - Versão alternativa "EXPERIENCE"
          'black': '#0c0e12',             // Preto - Fundos escuros e texto principal
          'white': '#FFFFFF',             // Branco - Fundo e contraste
          'blue': '#1e3a8a',              // Azul - Para compatibilidade e contraste
        },
        // Aliases for compatibility with existing code
        teal: {
          DEFAULT: '#ff7043',
          50: '#fff5f2',
          100: '#ffe9e3',
          200: '#ffd3c7',
          300: '#ffbdab',
          400: '#ffa78f',
          500: '#ff7043',
          600: '#ff5a27',
          700: '#e64420',
          800: '#b3341a',
          900: '#802413',
        },
        orange: {
          DEFAULT: '#ff4035',
          50: '#fff2f1',
          100: '#ffe5e3',
          200: '#ffcbc7',
          300: '#ffb1ab',
          400: '#ff978f',
          500: '#ff4035',
          600: '#ff2a1d',
          700: '#e61f14',
          800: '#b31810',
          900: '#80110b',
        },
        dark: {
          DEFAULT: '#0c0e12',
          100: '#1F2937',
          200: '#1a1c20',
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
        glow: "0 0 20px rgba(255, 112, 67, 0.5)",           // Laranja Coral
        "glow-orange": "0 0 20px rgba(255, 64, 53, 0.5)",  // Laranja Intenso
        "glow-gradient": "0 0 30px rgba(255, 133, 73, 0.4)", // Laranja Gradiente
        subtle: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        medium: "0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)",
        heavy: "0 10px 40px rgba(0,0,0,0.16)",
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.2', fontWeight: '800' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', fontWeight: '800' }],
        'heading': ['1.875rem', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-sm': ['1.5rem', { lineHeight: '1.4', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
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
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 112, 67, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(255, 112, 67, 0.6)" },
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
        'hero-gradient': 'linear-gradient(135deg, #0c0e12 0%, #1F2937 50%, #0c0e12 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
