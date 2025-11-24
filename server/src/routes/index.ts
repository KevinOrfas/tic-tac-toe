import http from 'node:http';
import crypto from 'node:crypto';
import {createGame, getAllGames, getGameById} from '../operations/index.js';

export async function handleGamesRoute(
  _req: http.IncomingMessage,
  res: http.ServerResponse
) {
  const games = await getAllGames();
  const formattedGames = games.map(game => ({
    id: game.id,
    winner: game.winner || '',
    timeSpent: game.time_spent || '',
    gameName: game.game_name || '',
  }));
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(formattedGames));
}

export async function handleGetGameRoute(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  const gameId = req.url?.split('/').pop();

  if (!gameId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Game ID required' }));
    return;
  }

  const game = await getGameById(gameId);

  if (!game) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Game not found' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      id: game.id,
      gameName: game.game_name || '',
      winner: game.winner || '',
      timeSpent: game.time_spent || '',
      player1Name: game.player1_name,
      player2Name: game.player2_name,
      moves: game.moves,
    })
  );
}

export async function handleCreateGameRoute(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { gameName } = JSON.parse(body);
      const gameId = crypto.randomUUID();
      const game = await createGame(gameId, 'Player 1', gameName);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          id: game?.id,
          gameName: game?.game_name || '',
          winner: '',
          timeSpent: game?.time_spent || '',
        })
      );
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  });
}
