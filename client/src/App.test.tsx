import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  beforeEach(() => {
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

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '89aea61e-573f-4ba1-97cd-c66b7f2a74bc',
        gameName: 'New Game',
        winner: '',
        timeSpent: '',
      }),
    } as Response);

    const button = screen.getByRole('button', { name: /New Game/i });
    await user.click(button);

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

    await waitFor(() => {
      expect(window.location.pathname).toMatch(/^\/game\/[a-f0-9-]{36}$/);
    });
  });
});
