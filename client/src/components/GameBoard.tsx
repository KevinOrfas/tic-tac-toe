import { useState } from 'react';
import { calculateWinner, createEmptyBoard, type Cell } from '../utils/gameLogic';

interface GameBoardProps {
  gameId: string;
}

export function GameBoard({ gameId }: GameBoardProps) {
  const [board, setBoard] = useState<Cell[]>(createEmptyBoard);
  const [isXNext, setIsXNext] = useState(true);

  const winner = calculateWinner(board);
  const isBoardFull = board.every(cell => cell !== null);
  const isDraw = !winner && isBoardFull;

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
      <p>Game ID: {gameId}</p>
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
