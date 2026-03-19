import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { GameProvider } from '../context/GameContext';

export function renderWithProviders(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  return render(
    <BrowserRouter>
      <GameProvider>{ui}</GameProvider>
    </BrowserRouter>
  );
}

