// Premium color palette
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  accent: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
  },
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// Spacing system (in rem)
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

// Typography
export const typography = {
  fonts: {
    sans: '"Inter", system-ui, -apple-system, sans-serif',
    serif: '"Playfair Display", Georgia, serif',
    mono: '"JetBrains Mono", monospace',
  },
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  ring: '0 0 0 3px rgba(14, 165, 233, 0.15)',
};

// Animations
export const animations = {
  transition: 'all 0.3s ease-in-out',
  hover: {
    scale: 'scale(1.02)',
    lift: 'translateY(-2px)',
  },
  entrance: {
    fadeIn: 'fade-in 0.5s ease-out',
    slideUp: 'slide-up 0.5s ease-out',
    pop: 'pop 0.3s ease-out',
  },
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

// Z-index
export const zIndex = {
  behind: -1,
  base: 0,
  above: 1,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
};

// Layout
export const layout = {
  maxWidth: '1440px',
  containerPadding: '1rem',
  sectionSpacing: '4rem',
  gridGap: '2rem',
};

// Custom styles for specific components
export const components = {
  card: {
    background: '#ffffff',
    border: '1px solid',
    borderColor: 'neutral.200',
    borderRadius: 'lg',
    shadow: 'lg',
    transition: 'all 0.3s ease-in-out',
    hover: {
      shadow: 'xl',
      transform: 'translateY(-4px)',
    },
  },
  button: {
    primary: {
      background: 'primary.600',
      color: 'white',
      hover: {
        background: 'primary.700',
      },
    },
    secondary: {
      background: 'secondary.600',
      color: 'white',
      hover: {
        background: 'secondary.700',
      },
    },
  },
  input: {
    background: 'white',
    border: '2px solid',
    borderColor: 'neutral.200',
    borderRadius: 'md',
    focus: {
      borderColor: 'primary.500',
      ring: true,
    },
  },
};