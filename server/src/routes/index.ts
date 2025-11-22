import http from 'node:http';
import { getGames } from '../operations/index.js';

export function handleGamesRoute(
  _req: http.IncomingMessage,
  res: http.ServerResponse
) {
  const games = getGames();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(games));
}

export function handleCreateGameRoute(
  _req: http.IncomingMessage,
  res: http.ServerResponse
) {
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      id: '1',
      gameName: 'Test Game',
      winner: '',
      timeSpent: '',
    })
  );
}
