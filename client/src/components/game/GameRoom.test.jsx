import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import GameRoom from './GameRoom';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

jest.mock('sweetalert2', () => ({
  __esModule: true,
  default: { fire: jest.fn().mockResolvedValue({ isConfirmed: false }) },
}));

describe('GameRoom', () => {
  beforeEach(() => {
    localStorage.removeItem('PokerfacePlayerName');
  });

  test('prompts for a player name and saves it', () => {
    renderWithProviders(<GameRoom />, { route: '/game/test-room' });

    const input = screen.getByLabelText(/player name/i);
    fireEvent.change(input, { target: { value: 'Alice' } });

    const button = screen.getByRole('button', { name: /join game/i });
    fireEvent.click(button);

    expect(localStorage.getItem('PokerfacePlayerName')).toBe('INTENTIONALLY_BROKEN');
  });
});

