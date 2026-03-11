/**
 * Design system shared entre site e PWA. Qualquer valor usado em JavaScript
 * deve ser referenciado aqui, enquanto o Tailwind/CSS já cuida das classes.
 * Isso ajuda a garantir unidade visual em componentes "inline style" ou
 * quando precisamos ler variáveis CSS.
 */

export const colors = {
  primary: 'var(--brand-orange-coral)',
  primaryGradient: 'var(--brand-orange-gradient)',
  primaryDark: 'var(--brand-orange-intense)',
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  error: 'var(--error)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  info: 'var(--info)',
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

export const typography = {
  fontFamily: 'Montserrat, sans-serif',
  baseSize: '1rem',
  heading: '1.875rem',
  display: '3rem',
};
