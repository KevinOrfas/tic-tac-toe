export interface ResponseShape {
  id: string;
  timeSpent: string;
  gameName: string;
  winner: string;
}
export function getGames(): ResponseShape[] {
  const data = [
    { id: '1', winner: 'Player 1', timeSpent: '', gameName: 'Sal' },
    { id: '2', winner: 'Player 2', timeSpent: '', gameName: 'Santiago' },
  ];
  return data;
}
