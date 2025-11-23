import { useState, useEffect } from 'react';
import {
  calculateWinner,
  createEmptyBoard,
  type Cell,
} from '../utils/gameLogic';
import { useSocket } from '../hooks/useSocket.ts';
import type { GameResponse, ErrorResponse } from '@shared/types';
import { ErrorMessage } from './ErrorMessage.tsx';
import styles from './GameBoard.module.css';

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

    const handleMoveMade = (data: { cellIndex: number; player: string }) => {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[data.cellIndex] = data.player as Cell;
        return newBoard;
      });
      setIsXNext(data.player !== 'X');
      setError((prevError) => (prevError !== null ? null : prevError));
    };

    socket.on('gameJoined', handleGameJoined);
    socket.on('error', handleError);
    socket.on('connect', handleConnect);
    socket.on('moveMade', handleMoveMade);

    if (socket.connected) {
      socket.emit('joinGame', { gameId, playerName: 'Player 2' });
    } else {
      socket.connect();
    }

    return () => {
      socket.off('gameJoined', handleGameJoined);
      socket.off('error', handleError);
      socket.off('connect', handleConnect);
      socket.off('moveMade', handleMoveMade);
    };
  }, [socket, gameId]);

  const handleCellClick = (index: number) => {
    if (board[index] || winner) {
      return;
    }

    socket.emit('makeMove', { gameId, cellIndex: index });
  };
  return (
    <div className={styles['game-board']}>
      <h1 className={styles['game-board__title']}>Tic-Tac-Toe</h1>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <div className={styles['game-board__layout']}>
        <div className={styles['game-board__board-section']}>
          <div className={styles['board-grid']} data-testid="game-grid">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                className={`${styles['board-grid__cell']} ${
                  cell === 'X'
                    ? styles['board-grid__cell--x']
                    : cell === 'O'
                      ? styles['board-grid__cell--o']
                      : ''
                }`}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>

        <div className={styles['game-board__info-section']}>
          <div className={styles.card}>
            <div className={styles['player-info']}>
              <div className={styles['player-info__game-id-label']}>
                Game ID
              </div>
              <div className={styles['player-info__game-id-value']}>
                {gameId}
              </div>
              {playerNumber && (
                <div
                  className={`${styles['player-info__badge']} ${
                    playerNumber === 1
                      ? styles['player-info__badge--player-1']
                      : styles['player-info__badge--player-2']
                  }`}
                >
                  You are Player {playerNumber} ({playerNumber === 1 ? 'X' : 'O'}
                  )
                </div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles['game-status']}>
              {winner && (
                <span className={styles['game-status__text--winner']}>
                  🎉 Winner: {winner}
                </span>
              )}
              {isDraw && (
                <span className={styles['game-status__text--draw']}>
                  🤝 Draw
                </span>
              )}
              {!winner && !isDraw && (
                <span className={styles['game-status__text--next']}>
                  Next player: {isXNext ? 'X' : 'O'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
