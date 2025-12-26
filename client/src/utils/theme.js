/**
 * Theme Utilities
 * Manages dark/light mode and theme configuration
 */

/**
 * Initialize theme on app load
 */
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let isDark = false;
  
  if (savedTheme) {
    isDark = savedTheme === 'dark';
  } else {
    isDark = prefersDark;
  }
  
  applyTheme(isDark);
  return isDark;
};

/**
 * Apply theme to the document
 * @param {boolean} isDark - Whether to use dark mode
 */
export const applyTheme = (isDark) => {
  const html = document.documentElement;
  const isDarkCurrently = html.classList.contains('dark');
  
  if (isDark && !isDarkCurrently) {
    html.classList.add('dark');
  } else if (!isDark && isDarkCurrently) {
    html.classList.remove('dark');
  }
  
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

/**
 * Toggle between dark and light mode
 * @returns {boolean} New theme state (true = dark, false = light)
 */
export const toggleTheme = () => {
  const html = document.documentElement;
  const isDark = !html.classList.contains('dark');
  applyTheme(isDark);
  return isDark;
};

/**
 * Get current theme
 * @returns {string} 'dark' or 'light'
 */
export const getCurrentTheme = () => {
  const html = document.documentElement;
  return html.classList.contains('dark') ? 'dark' : 'light';
};

/**
 * Check if dark mode is enabled
 * @returns {boolean} True if dark mode is active
 */
export const isDarkMode = () => {
  return document.documentElement.classList.contains('dark');
};

/**
 * Color constants for both themes
 */
export const colors = {
  light: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#0ea5e9',
    
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    
    bg: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6'
    },
    
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af'
    }
  },
  
  dark: {
    primary: '#60a5fa',
    secondary: '#a78bfa',
    success: '#34d399',
    danger: '#f87171',
    warning: '#fbbf24',
    info: '#38bdf8',
    
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    
    bg: {
      primary: '#0f1419',
      secondary: '#1a1f2e',
      tertiary: '#2d333f'
    },
    
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      tertiary: '#9ca3af'
    }
  }
};

/**
 * Get color for current theme
 * @param {string} colorPath - Path to color (e.g., 'primary', 'gray.500', 'bg.secondary')
 * @returns {string} Color hex value
 */
export const getThemeColor = (colorPath) => {
  const theme = isDarkMode() ? colors.dark : colors.light;
  const parts = colorPath.split('.');
  
  let color = theme;
  for (const part of parts) {
    color = color[part];
    if (!color) return null;
  }
  
  return color;
};
