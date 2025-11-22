import http from 'node:http';
import { getGames } from '../operations/index.js';

export function handleGamesRoute(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  const games = getGames();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(games));
}
