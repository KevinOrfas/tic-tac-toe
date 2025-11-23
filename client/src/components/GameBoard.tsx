import { useState } from 'react';

interface GameBoardProps {
  gameId: string;
}
type Cell = 'X' | 'O' | null;

export function GameBoard({ gameId }: GameBoardProps) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const handleCellClick = (index: number) => {
    if (board[index]) {
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
