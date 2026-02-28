export const theme = {
  colors: {
    background: '#f5f5f0',
    card: '#ffffff',
    cardGlass: 'rgba(255, 255, 255, 0.8)',
    primary: '#5A5A40',
    primaryLight: '#8A8A70',
    primaryDark: '#3A3A30',
    text: '#3A3A30',
    textSecondary: '#7A7A70',
    success: 'rgba(76, 175, 80, 0.15)',
    successText: '#4CAF50',
    warning: 'rgba(255, 152, 0, 0.15)',
    warningText: '#FF9800',
    danger: 'rgba(244, 67, 54, 0.15)',
    dangerText: '#F44336',
    info: 'rgba(33, 150, 243, 0.15)',
    infoText: '#2196F3',
  },
  fonts: {
    title: "'Cormorant Garamond', serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  fontSizes: {
    xl: '28px',
    lg: '20px',
    md: '16px',
    sm: '14px',
    xs: '12px',
  },
  radii: {
    md: '16px',
    lg: '24px',
    xl: '40px',
  },
  shadows: {
    card: '0 4px 20px rgba(90, 90, 64, 0.08)',
    float: '0 8px 32px rgba(90, 90, 64, 0.12)',
    button: '0 2px 8px rgba(90, 90, 64, 0.15)',
  },
  transitions: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};

export type Theme = typeof theme;
