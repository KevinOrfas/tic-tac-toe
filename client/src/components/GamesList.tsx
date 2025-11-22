export interface ResponseShape {
  id: string;
  timeSpent: string;
  gameName: string;
  winner: string;
}

interface GamesListProps {
  gamesResult: ResponseShape[];
}

export const GamesList = ({ gamesResult }: GamesListProps) => {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {gamesResult.map(({ gameName, id, winner }, index) => (
        <li
          key={id + index}
          style={{
            padding: '12px',
            margin: '8px 0',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {gameName}
          </div>
          <div style={{ fontSize: '14px', color: '#fff' }}>
            Winner: {winner}
          </div>
        </li>
      ))}
    </ul>
  );
};
