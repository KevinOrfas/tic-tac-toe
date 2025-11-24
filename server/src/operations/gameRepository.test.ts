import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createGame, getAllGames } from './gameRepository.js';
import { pool } from '../db.js';

describe('Game Repository', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM games');
  });

  it('should create a new game', async () => {
    const gameId = randomUUID();
    const game = await createGame(gameId, 'Alice');

    expect(game).toBeDefined();
    expect(game?.id).toBe(gameId);
    expect(game?.player1_name).toBe('Alice');
    expect(game?.player2_name).toBeNull();
    expect(game?.winner).toBeNull();
    expect(game?.moves).toEqual([]);
  });

  it('should get all games', async () => {
    const game1Id = randomUUID();
    const game2Id = randomUUID();
    const game3Id = randomUUID();

    await createGame(game1Id, 'Alice', 'Game 1');
    await createGame(game2Id, 'Bob', 'Game 2');
    await createGame(game3Id, 'Charlie', 'Game 3');

    const games = await getAllGames();

    expect(games).toHaveLength(3);
    expect(games[0]?.player1_name).toBe('Charlie');
    expect(games[1]?.player1_name).toBe('Bob');
    expect(games[2]?.player1_name).toBe('Alice');
  });
});
