import { screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameBoard } from './GameBoard.tsx';
import userEvent from '@testing-library/user-event';
import { renderWithSocket } from '../test/helpers.tsx';
import * as SocketContext from '../hooks/useSocket';
import type { Socket } from 'socket.io-client';

const mockEmit = vi.fn();
const mockOn = vi.fn();
const mockOff = vi.fn();
const mockSocket = {
  id: '1',
  emit: mockEmit,
  on: mockOn,
  off: mockOff,
  connected: true,
  connect: vi.fn(),
} as Partial<Socket> as Socket;

describe('GameBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(SocketContext, 'useSocket').mockReturnValue(mockSocket);

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ moves: [], winner: null }),
      })
    ) as any;
  });

  it('renders a 3x3 grid of cells', () => {
    renderWithSocket(<GameBoard gameId="123" />);

    const grid = screen.getByTestId('game-grid');
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(9);
    expect(grid).toBeInTheDocument();
    expect(grid.className).toContain('board-grid');
  });

  it('should emit makeMove when cell is clicked', async () => {
    renderWithSocket(<GameBoard gameId="123" />);

    const [, bothPlayersJoinedHandler] = mockOn.mock.calls.find(
      (call) => call[0] === 'bothPlayersJoined'
    )!;

    act(() => {
      bothPlayersJoinedHandler();
    });

    const [cell] = screen.getAllByRole('button');
    await userEvent.click(cell);

    expect(mockEmit).toHaveBeenCalledWith('makeMove', {
      gameId: '123',
      cellIndex: 0,
    });
  });

  it('should register socket event listeners on mount', () => {
    renderWithSocket(<GameBoard gameId="123" />);

    expect(mockOn).toHaveBeenCalledWith('gameJoined', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('moveMade', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith(
      'playerDisconnected',
      expect.any(Function)
    );
  });

  it('should emit joinGame when socket is already connected', () => {
    renderWithSocket(<GameBoard gameId="123" />);

    expect(mockEmit).toHaveBeenCalledWith('joinGame', {
      gameId: '123',
      playerName: 'Player 2',
    });
  });

  it('should update board when moveMade event is received', () => {
    renderWithSocket(<GameBoard gameId="123" />);
    const cells = screen.getAllByRole('button');

    const [, moveMadeHandler] = mockOn.mock.calls.find(
      (call) => call[0] === 'moveMade'
    )!;

    act(() => {
      moveMadeHandler({ cellIndex: 0, player: 'X' });
    });

    expect(cells[0]).toHaveTextContent('X');
  });

  it('should update board with O when second move is made', () => {
    renderWithSocket(<GameBoard gameId="123" />);
    const cells = screen.getAllByRole('button');

    const [, moveMadeHandler] = mockOn.mock.calls.find(
      (call) => call[0] === 'moveMade'
    )!;

    act(() => {
      moveMadeHandler({ cellIndex: 0, player: 'X' });
    });
    expect(cells[0]).toHaveTextContent('X');

    act(() => {
      moveMadeHandler({ cellIndex: 1, player: 'O' });
    });
    expect(cells[1]).toHaveTextContent('O');
  });

  it('should clear error when moveMade event is received', () => {
    renderWithSocket(<GameBoard gameId="123" />);

    const [, errorHandler] = mockOn.mock.calls.find(
      (call) => call[0] === 'error'
    )!;

    act(() => {
      errorHandler({ message: 'Not your turn' });
    });

    expect(screen.getByText(/Not your turn/i)).toBeInTheDocument();

    const [, moveMadeHandler] = mockOn.mock.calls.find(
      (call) => call[0] === 'moveMade'
    )!;

    act(() => {
      moveMadeHandler({ cellIndex: 0, player: 'X' });
    });

    expect(screen.queryByText(/Not your turn/i)).not.toBeInTheDocument();
  });

  it('should not allow clicking after a winner is found', async () => {
    renderWithSocket(<GameBoard gameId="123" />);
    const cells = screen.getAllByRole('button');

    await userEvent.click(cells[0]);
    await userEvent.click(cells[3]);
    await userEvent.click(cells[1]);
    await userEvent.click(cells[4]);
    await userEvent.click(cells[2]);

    await userEvent.click(cells[5]);

    expect(cells[5]).toHaveTextContent('');
  });

  it('should show "Draw" only when board is full with no winner', () => {
    renderWithSocket(<GameBoard gameId="123" />);

    const [, bothPlayersJoinedHandler] = mockOn.mock.calls.find(
      (call) => call[0] === 'bothPlayersJoined'
    )!;
    const [, moveMadeHandler] = mockOn.mock.calls.find(
      (call) => call[0] === 'moveMade'
    )!;

    act(() => {
      bothPlayersJoinedHandler();
    });

    act(() => {
      moveMadeHandler({ cellIndex: 0, player: 'X' });
      moveMadeHandler({ cellIndex: 1, player: 'O' });
      moveMadeHandler({ cellIndex: 2, player: 'X' });
      moveMadeHandler({ cellIndex: 4, player: 'O' });
      moveMadeHandler({ cellIndex: 3, player: 'X' });
      moveMadeHandler({ cellIndex: 5, player: 'O' });
      moveMadeHandler({ cellIndex: 7, player: 'X' });
      moveMadeHandler({ cellIndex: 6, player: 'O' });
      moveMadeHandler({ cellIndex: 8, player: 'X' });
    });

    expect(screen.getByText(/Draw/i)).toBeInTheDocument();
    expect(screen.queryByText(/Winner/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Next player/i)).not.toBeInTheDocument();
  });

  it('should display error message when a player disconnects', () => {
    renderWithSocket(<GameBoard gameId="123" />);

    const [, playerDisconnectedHandler] = mockOn.mock.calls.find(
      (call) => call[0] === 'playerDisconnected'
    )!;

    act(() => {
      playerDisconnectedHandler({
        playerNumber: 1,
        playerName: 'Player1',
      });
    });

    expect(
      screen.getByText(/Player 1 \(Player1\) has disconnected/i)
    ).toBeInTheDocument();
  });
});
