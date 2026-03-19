import React from 'react';
import { GameContext } from './GameContext';
import { renderWithProviders } from '../test-utils/renderWithProviders';

jest.mock('sweetalert2', () => ({
  __esModule: true,
  default: { fire: jest.fn().mockResolvedValue({ isConfirmed: false }) },
}));

describe('GameContext', () => {
  beforeEach(() => {
    localStorage.setItem('PokerfaceLocalUserToken', 'test-token');
    localStorage.setItem('PokerfacePlayerName', 'Tester');
    localStorage.setItem('PokerfaceShownLatestUpdatesMessage', 'true');
    sessionStorage.setItem('kickedGames', JSON.stringify([]));
    global.WebSocket = jest.fn().mockImplementation(function () {
      this.send = jest.fn();
      this.addEventListener = jest.fn();
      this.close = jest.fn();
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.resetAllMocks();
  });

  test('sendMessage formats outgoing payload correctly', () => {
    const Child = () => {
      const { sendMessage } = React.useContext(GameContext);

      React.useEffect(() => {
        sendMessage('updatedCardChoice', { card: { value: '5' } });
      }, [sendMessage]);

      return <div>child</div>;
    };

    renderWithProviders(<Child />, { route: '/game/room-1' });

    expect(global.WebSocket).toHaveBeenCalledTimes(1);
    const instance = global.WebSocket.mock.instances[0];
    expect(instance.send).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(instance.send.mock.calls[0][0]);

    expect(payload.gameId).toBe('room-1');
    expect(payload.token).toBe('test-token');
    expect(payload.body.card).toEqual({ value: '5' });
    expect(payload.body.reqType.type).toBe('updatedCardChoice');
    expect(typeof payload.body.reqType.timeStamp).toBe('number');
  });
});

