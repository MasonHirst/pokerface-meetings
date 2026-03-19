import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import { GameProvider } from '../context/GameContext';

const theme = createTheme({
  palette: {
    primary: { main: blue[500] },
    secondary: { main: '#9c4fd7' },
    white: { main: '#ffffff' },
    success: { main: '#4caf50' },
  },
});

export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/game/:game_id" element={<GameProvider>{ui}</GameProvider>} />
          <Route path="/*" element={<GameProvider>{ui}</GameProvider>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
}

