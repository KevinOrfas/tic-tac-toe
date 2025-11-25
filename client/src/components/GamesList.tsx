import { useLocation } from 'wouter';

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
  const [, setLocation] = useLocation();

  const handleGameClick = (gameId: string) => {
    setLocation(`/game/${gameId}`);
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {gamesResult.map(({ gameName, id, winner }, index) => (
        <li
          key={id + index}
          onClick={() => handleGameClick(id)}
          style={{
            padding: '12px',
            margin: '8px 0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {gameName}
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
            Game ID: {id}
          </div>
          <div style={{ fontSize: '14px', color: '#fff' }}>
            Winner: {winner}
          </div>
        </li>
      ))}
    </ul>
  );
};
