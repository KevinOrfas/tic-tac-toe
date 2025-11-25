import { useState, useEffect } from 'react';
import {
  calculateWinner,
  createEmptyBoard,
  type Cell,
} from '../utils/gameLogic';
import { useSocket } from '../hooks/useSocket.ts';
import { useLocation } from 'wouter';
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
  const [, setLocation] = useLocation();

  const socket = useSocket();
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [bothPlayersJoined, setBothPlayersJoined] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [gameName, setGameName] = useState<string>('');

  const winner = calculateWinner(board);
  const isBoardFull = board.every((cell) => cell !== null);
  const isDraw = !winner && isBoardFull;

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(`/api/v1/games/${gameId}`);
        if (response.ok) {
          const gameData = await response.json();

          if (gameData.winner) {
            setIsViewOnly(true);
            setGameName(gameData.gameName || '');

            const newBoard = createEmptyBoard();
            gameData.moves?.forEach((move: { cellIndex: number; player: 'X' | 'O' }) => {
              newBoard[move.cellIndex] = move.player;
            });
            setBoard(newBoard);

            const xMoves = gameData.moves?.filter((m: { player: string }) => m.player === 'X').length || 0;
            const oMoves = gameData.moves?.filter((m: { player: string }) => m.player === 'O').length || 0;
            setIsXNext(xMoves === oMoves);

            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch game data:', err);
      }
    };

    fetchGameData();
  }, [gameId]);

  useEffect(() => {
    if (isViewOnly) {
      return;
    }

    const handleGameJoined = (data: GameResponse) => {
      setPlayerNumber(data.playerNumber);
      setError(null);
    };

    const handleBothPlayersJoined = () => {
      setBothPlayersJoined(true);
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

    const handlePlayerDisconnected = (data: {
      playerNumber: number;
      playerName: string;
    }) => {
      setError(
        `Player ${data.playerNumber} (${data.playerName}) has disconnected`
      );
    };

    const handleGameOver = () => {
      setTimeout(() => {
        setLocation('/');
      }, 2000);
    };

    socket.on('gameJoined', handleGameJoined);
    socket.on('bothPlayersJoined', handleBothPlayersJoined);
    socket.on('error', handleError);
    socket.on('connect', handleConnect);
    socket.on('moveMade', handleMoveMade);
    socket.on('playerDisconnected', handlePlayerDisconnected);
    socket.on('gameOver', handleGameOver);

    if (socket.connected) {
      socket.emit('joinGame', { gameId, playerName: 'Player 2' });
    } else {
      socket.connect();
    }

    return () => {
      socket.off('gameJoined', handleGameJoined);
      socket.off('bothPlayersJoined', handleBothPlayersJoined);
      socket.off('error', handleError);
      socket.off('connect', handleConnect);
      socket.off('moveMade', handleMoveMade);
      socket.off('playerDisconnected', handlePlayerDisconnected);
      socket.off('gameOver', handleGameOver);
    };
  }, [socket, gameId, setLocation, isViewOnly]);

  useEffect(() => {
    if (winner || isDraw) {
      socket.emit('gameEnded', { gameId, winner, isDraw });
    }
  }, [winner, isDraw, gameId, socket]);

  const handleCellClick = (index: number) => {
    if (isViewOnly) {
      return;
    }

    if (!bothPlayersJoined) {
      setError('Waiting for another player to join...');
      return;
    }

    if (board[index] || winner) {
      return;
    }

    socket.emit('makeMove', { gameId, cellIndex: index });
  };
  return (
    <div className={styles['game-board']}>
      <h1 className={styles['game-board__title']}>
        {isViewOnly ? 'Game History' : 'Tic-Tac-Toe'}
      </h1>

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
                disabled={isViewOnly}
                className={`${styles['board-grid__cell']} ${
                  cell === 'X'
                    ? styles['board-grid__cell--x']
                    : cell === 'O'
                      ? styles['board-grid__cell--o']
                      : ''
                }`}
                style={isViewOnly ? { cursor: 'not-allowed', opacity: 0.8 } : {}}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>

        <div className={styles['game-board__info-section']}>
          <div className={styles.card}>
            <div className={styles['player-info']}>
              {isViewOnly ? (
                <>
                  <div className={styles['player-info__game-id-label']}>
                    {gameName || 'Completed Game'}
                  </div>
                  <div className={styles['player-info__game-id-value']}>
                    {gameId}
                  </div>
                  <div style={{ marginTop: '8px', color: '#888', fontSize: '14px' }}>
                    View Only Mode
                  </div>
                </>
              ) : (
                <>
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
                      You are Player {playerNumber} (
                      {playerNumber === 1 ? 'X' : 'O'})
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles['game-status']}>
              {isViewOnly && winner && (
                <span className={styles['game-status__text--winner']}>
                  Winner: {winner}
                </span>
              )}
              {isViewOnly && isDraw && (
                <span className={styles['game-status__text--draw']}>
                  Draw
                </span>
              )}
              {!isViewOnly && !bothPlayersJoined && (
                <span className={styles['game-status__text--next']}>
                  ⏳ Waiting for player 2 to join...
                </span>
              )}
              {!isViewOnly && bothPlayersJoined && winner && (
                <span className={styles['game-status__text--winner']}>
                  🎉 Winner: {winner}
                </span>
              )}
              {!isViewOnly && bothPlayersJoined && isDraw && (
                <span className={styles['game-status__text--draw']}>
                  🤝 Draw
                </span>
              )}
              {!isViewOnly && bothPlayersJoined && !winner && !isDraw && (
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
