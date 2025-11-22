interface GameBoardProps {
  gameId: string;
}
export function GameBoard({ gameId }: GameBoardProps) {
  const board = Array(9).fill(null);
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
              style={{
                width: '100px',
                height: '100px',
                fontSize: '24px',
                border: '2px solid #ddd',
                backgroundColor: '#fff',
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
