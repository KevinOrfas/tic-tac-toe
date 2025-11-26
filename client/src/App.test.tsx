import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import App from './App';

const mockEmit = vi.fn();
const mockOn = vi.fn();
const mockOff = vi.fn();

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    emit: mockEmit,
    on: mockOn,
    off: mockOff,
    connected: true,
    connect: vi.fn(),
  })),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn() as typeof fetch;
  });

  it('renders the app with title and button', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<App />);

    expect(screen.getByText(/Multiplayer Tic-Tac-Toe/i)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /New Game/i });
    expect(button).toBeInTheDocument();

    // Wait for useEffect to complete
    await waitFor(() => {
      expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledTimes(1);
    });
  });

  it.skip('should list a new game upon clicking the button', async () => {
    const user = userEvent.setup();

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<App />);

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '1',
        gameName: 'Test Gamee',
        winner: '',
        timeSpent: '',
      }),
    } as Response);

    const button = screen.getByRole('button', { name: /New Game/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Test Gamee')).toBeInTheDocument();
    });
  });

  it('should navigate to game board when clicking New Game', async () => {
    const user = userEvent.setup();

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<App />);

    await waitFor(() => {
      expect(mockOn).toHaveBeenCalledWith('gameCreated', expect.any(Function));
    });

    const gameCreatedHandler = mockOn.mock.calls.find(
      (call) => call[0] === 'gameCreated'
    )![1];

    const button = screen.getByRole('button', { name: /New Game/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockEmit).toHaveBeenCalledWith('createGame', {
        playerName: 'Player 1',
      });
    });

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '89aea61e-573f-4ba1-97cd-c66b7f2a74bc',
        gameName: 'New Game',
        winner: null,
        moves: [],
        player1Name: 'Player 1',
        player2Name: null,
        timeSpent: '',
      }),
    } as Response);

    act(() => {
      gameCreatedHandler({
        gameId: '89aea61e-573f-4ba1-97cd-c66b7f2a74bc',
        playerNumber: 1,
      });
    });

    await waitFor(() => {
      expect(window.location.pathname).toMatch(/^\/game\/[a-f0-9-]{36}$/);
    });
  });
});
