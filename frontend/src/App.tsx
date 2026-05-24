// ============================================================
//  RotaCerta Monitor — Raiz da Aplicação
//  Salvar em: src/App.tsx
// ============================================================

import { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MonitorDashboard from './pages/MonitorDashboard';

// ── Tema Dark Industrial ─────────────────────────────────────────────────────
function useAppTheme() {
  return useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'dark',
          background: {
            default: '#070B14',
            paper: '#0D1320',
          },
          primary: {
            main: '#0090FF',
            light: '#33A8FF',
            dark: '#0060CF',
          },
          error: {
            main: '#FF2D55',
          },
          warning: {
            main: '#FF9F0A',
          },
          success: {
            main: '#32D74B',
          },
          info: {
            main: '#00C8FF',
          },
          text: {
            primary: '#E8EDF5',
            secondary: 'rgba(232,237,245,0.55)',
            disabled: 'rgba(232,237,245,0.25)',
          },
          divider: 'rgba(255,255,255,0.07)',
        },

        typography: {
          fontFamily: '"Rajdhani", "Roboto", sans-serif',
          h1: { fontWeight: 800, letterSpacing: '-0.5px' },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 700 },
          button: { fontWeight: 700, letterSpacing: '1px' },
        },

        shape: { borderRadius: 10 },

        components: {
          MuiCssBaseline: {
            styleOverrides: `
              @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap');

              *, *::before, *::after {
                box-sizing: border-box;
              }

              html, body, #root {
                margin: 0;
                padding: 0;
                min-height: 100vh;
                background: #070B14;
              }

              ::selection {
                background: rgba(0, 144, 255, 0.3);
                color: #fff;
              }

              ::-webkit-scrollbar {
                width: 6px;
                height: 6px;
              }
              ::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.03);
              }
              ::-webkit-scrollbar-thumb {
                background: rgba(0, 200, 255, 0.2);
                border-radius: 4px;
              }
              ::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 200, 255, 0.4);
              }
            `,
          },

          MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },

          MuiChip: {
            styleOverrides: {
              root: {
                fontFamily: '"Rajdhani", "Roboto", sans-serif',
                fontWeight: 700,
              },
            },
          },

          MuiSkeleton: {
            defaultProps: { animation: 'wave' },
          },
        },
      }),
    []
  );
}

// ── Componente Raiz ──────────────────────────────────────────────────────────
export default function App() {
  const theme = useAppTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MonitorDashboard />
    </ThemeProvider>
  );
}
