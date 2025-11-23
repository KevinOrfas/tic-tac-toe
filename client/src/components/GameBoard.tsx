import { useState } from 'react';

interface GameBoardProps {
  gameId: string;
}
type Cell = 'X' | 'O' | null;

function calculateWinner(board: Cell[]) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of winningCombinations) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function GameBoard({ gameId }: GameBoardProps) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const winner = calculateWinner(board);

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
      {winner ? <h2>Winner: {winner}</h2> : <h2>Draw</h2>}
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
