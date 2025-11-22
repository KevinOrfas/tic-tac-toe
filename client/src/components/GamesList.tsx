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
    <ul>
      {gamesResult.map(({ gameName, id }, index) => (
        <li key={id + index}>{gameName}</li>
      ))}
    </ul>
  );
};
