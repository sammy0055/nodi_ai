export const theme = {
  colors: {
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
    error: '#ef4444',
    warning: '#f59e0b',
  },
  fonts: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui'],
    display: ['Cal Sans', 'Inter', 'ui-sans-serif'],
  },
  animation: {
    'fade-in': 'fadeIn 0.5s ease-in-out',
    'slide-up': 'slideUp 0.5s ease-out',
    'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  boxShadow: {
    soft: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
    medium: '0 6px 20px rgba(0, 0, 0, 0.12)',
    large: '0 10px 34px rgba(0, 0, 0, 0.15)',
  },
};

// Custom animations for Tailwind
export const customAnimations = {
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    slideUp: {
      '0%': { transform: 'translateY(10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
  },
  animation: {
    'fade-in': 'fadeIn 0.5s ease-in-out',
    'slide-up': 'slideUp 0.5s ease-out',
  },
};