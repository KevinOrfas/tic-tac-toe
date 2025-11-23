import { useState, useEffect } from 'react';
import {
  calculateWinner,
  createEmptyBoard,
  type Cell,
} from '../utils/gameLogic';
import { useSocket } from '../hooks/useSocket.ts';
import type { GameResponse, ErrorResponse } from '@shared/types';
import { ErrorMessage } from './ErrorMessage.tsx';

interface GameBoardProps {
  gameId: string;
}

export function GameBoard({ gameId }: GameBoardProps) {
  const [board, setBoard] = useState<Cell[]>(createEmptyBoard);
  const [isXNext, setIsXNext] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socket = useSocket();
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);

  const winner = calculateWinner(board);
  const isBoardFull = board.every((cell) => cell !== null);
  const isDraw = !winner && isBoardFull;

  useEffect(() => {
    const handleGameJoined = (data: GameResponse) => {
      setPlayerNumber(data.playerNumber);
      setError(null);
    };

    const handleError = (error: ErrorResponse) => {
      setError(error.message);
    };

    const handleConnect = () => {
      socket.emit('joinGame', { gameId, playerName: 'Player 2' });
    };

    socket.on('gameJoined', handleGameJoined);
    socket.on('error', handleError);
    socket.on('connect', handleConnect);

    if (socket.connected) {
      socket.emit('joinGame', { gameId, playerName: 'Player 2' });
    } else {
      socket.connect();
    }

    return () => {
      socket.off('gameJoined', handleGameJoined);
      socket.off('error', handleError);
    };
  }, [socket, gameId]);

  const handleCellClick = (index: number) => {
    if (board[index] || winner) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };
  return (
    <div>
      <h1>Game Board</h1>
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      {playerNumber && <p>You are Player {playerNumber}</p>}
      {winner && <h2>Winner: {winner}</h2>}
      {isDraw && <h2>Draw</h2>}
      {!winner && !isDraw && <h2>Next player: {isXNext ? 'X' : 'O'}</h2>}
      <div>
        <h2>Game {gameId}</h2>
        <div
          data-testid="game-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 100px)',
            gap: '4px',
          }}
        >
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              style={{
                width: '100px',
                height: '100px',
                fontSize: '24px',
                border: '2px solid #ddd',
                backgroundColor: '#fff',
                color: cell === 'X' ? 'red' : 'blue',
                cursor: 'pointer',
              }}
            >
              {cell}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
