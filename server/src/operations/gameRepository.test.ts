import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createGame, getAllGames, updatePlayer2, addMove, completeGame } from './gameRepository.js';
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

  it('should get all games with winners only', async () => {
    const game1Id = randomUUID();
    const game2Id = randomUUID();
    const game3Id = randomUUID();

    await createGame(game1Id, 'Alice', 'Game 1');
    await createGame(game2Id, 'Bob', 'Game 2');
    await createGame(game3Id, 'Charlie', 'Game 3');

    await completeGame(game1Id, 'X');
    await completeGame(game3Id, 'D');

    const games = await getAllGames();

    expect(games).toHaveLength(2);
    expect(games[0]?.player1_name).toBe('Charlie');
    expect(games[0]?.winner).toBe('D');
    expect(games[1]?.player1_name).toBe('Alice');
    expect(games[1]?.winner).toBe('X');
  });

  it('should update player 2 name', async () => {
    const gameId = randomUUID();
    await createGame(gameId, 'Alice');

    const updated = await updatePlayer2(gameId, 'Bob');

    expect(updated).toBeDefined();
    expect(updated?.player1_name).toBe('Alice');
    expect(updated?.player2_name).toBe('Bob');
  });

  it('should add a move to the game', async () => {
    const gameId = randomUUID();
    await createGame(gameId, 'Alice');

    const updated = await addMove(gameId, { cellIndex: 0, player: 'X' });

    expect(updated).toBeDefined();
    expect(updated?.moves).toHaveLength(1);
    expect(updated?.moves[0]).toEqual({ cellIndex: 0, player: 'X' });
  });

  it('should add multiple moves to the game', async () => {
    const gameId = randomUUID();
    await createGame(gameId, 'Alice');

    await addMove(gameId, { cellIndex: 0, player: 'X' });
    await addMove(gameId, { cellIndex: 1, player: 'O' });
    const updated = await addMove(gameId, { cellIndex: 4, player: 'X' });

    expect(updated).toBeDefined();
    expect(updated?.moves).toHaveLength(3);
    expect(updated?.moves[0]).toEqual({ cellIndex: 0, player: 'X' });
    expect(updated?.moves[1]).toEqual({ cellIndex: 1, player: 'O' });
    expect(updated?.moves[2]).toEqual({ cellIndex: 4, player: 'X' });
  });

  it('should complete a game with a winner', async () => {
    const gameId = randomUUID();
    await createGame(gameId, 'Alice');

    const completed = await completeGame(gameId, 'X');

    expect(completed).toBeDefined();
    expect(completed?.winner).toBe('X');
    expect(completed?.completed_at).toBeDefined();
  });

  it('should complete a game with a draw', async () => {
    const gameId = randomUUID();
    await createGame(gameId, 'Alice');

    const completed = await completeGame(gameId, 'D');

    expect(completed).toBeDefined();
    expect(completed?.winner).toBe('D');
    expect(completed?.completed_at).toBeDefined();
  });
});
