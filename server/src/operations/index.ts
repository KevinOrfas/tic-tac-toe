import { Game } from '../types.js';

export function getGames(): Game[] {
  const data = [
    { id: '1', winner: 'Player 1', timeSpent: '', gameName: 'Sal' },
    { id: '2', winner: 'Player 2', timeSpent: '', gameName: 'Santiago' },
  ];
  return data;
}
