import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1e3a8a', // Dark blue
        light: '#3b82f6', // Lighter blue
        dark: '#1e40af', // Darker blue
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#1e40af', // Complementary blue
        light: '#2563eb', // Lighter blue
        dark: '#1e3a8a', // Darker blue
        contrastText: '#ffffff',
      },
      background: {
        default: darkMode ? '#0f172a' : '#fafafa',
        paper: darkMode ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#f1f5f9' : '#1f2937',
        secondary: darkMode ? '#94a3b8' : '#6b7280',
      },
      grey: {
        50: darkMode ? '#0f172a' : '#f9fafb',
        100: darkMode ? '#1e293b' : '#f3f4f6',
        200: darkMode ? '#334155' : '#e5e7eb',
        300: darkMode ? '#475569' : '#d1d5db',
        400: darkMode ? '#64748b' : '#9ca3af',
        500: darkMode ? '#94a3b8' : '#6b7280',
        600: darkMode ? '#cbd5e1' : '#4b5563',
        700: darkMode ? '#e2e8f0' : '#374151',
        800: darkMode ? '#f1f5f9' : '#1f2937',
        900: darkMode ? '#f8fafc' : '#111827',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h4: {
        fontWeight: 600,
        letterSpacing: '-0.025em',
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '-0.025em',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.025em',
      },
      body1: {
        lineHeight: 1.7,
      },
      body2: {
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.025em',
      },
    },
    shape: {
      borderRadius: 16,
    },
    shadows: [
      'none',
      '0px 1px 2px rgba(0, 0, 0, 0.05)',
      '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
      '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
      '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
      '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
      '0px 25px 50px rgba(0, 0, 0, 0.15)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: '0.95rem',
            fontWeight: 600,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          },
          contained: {
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            },
          },
          outlined: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: darkMode 
              ? '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: darkMode
                ? '0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                : '0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: darkMode 
              ? '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
          },
          elevation8: {
            boxShadow: darkMode
              ? '0 20px 25px rgba(0, 0, 0, 0.4), 0 10px 10px rgba(0, 0, 0, 0.3)'
              : '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1e3a8a',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1e3a8a',
              borderWidth: '2px',
            },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: darkMode 
              ? '0 1px 3px rgba(0, 0, 0, 0.3)'
              : '0 1px 3px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
