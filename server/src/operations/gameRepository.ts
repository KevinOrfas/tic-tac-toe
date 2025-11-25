import { query } from '../db.js';

export interface GameMove {
  cellIndex: number;
  player: 'X' | 'O';
}

export interface GameRecord {
  id: string;
  player1_name: string;
  player2_name: string | null;
  winner: 'X' | 'O' | 'D' | null;
  moves: GameMove[];
  created_at: Date;
  completed_at: Date | null;
  game_name: string | null;
  time_spent: string | null;
}

export async function createGame(
  gameId: string,
  player1Name: string,
  gameName?: string
): Promise<GameRecord | undefined> {
  const result = await query<GameRecord>(
    `INSERT INTO games (id, player1_name, moves, game_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, player1_name, player2_name, winner, moves, created_at, completed_at, game_name, time_spent`,
    [gameId, player1Name, '[]', gameName || null]
  );
  return result.rows[0];
}

export async function getGameById(gameId: string): Promise<GameRecord | null> {
  const result = await query<GameRecord>(
    `SELECT id, player1_name, player2_name, winner, moves, created_at, completed_at, game_name, time_spent
     FROM games
     WHERE id = $1`,
    [gameId]
  );
  return result.rows[0] || null;
}

export async function getAllGames(): Promise<GameRecord[]> {
  const result = await query<GameRecord>(
    `SELECT id, player1_name, player2_name, winner, moves, created_at, completed_at, game_name, time_spent
     FROM games
     WHERE winner IS NOT NULL
     ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function updatePlayer2(
  gameId: string,
  player2Name: string
): Promise<GameRecord | undefined> {
  const result = await query<GameRecord>(
    `UPDATE games
     SET player2_name = $1
     WHERE id = $2
     RETURNING id, player1_name, player2_name, winner, moves, created_at, completed_at, game_name, time_spent`,
    [player2Name, gameId]
  );
  return result.rows[0];
}

export async function addMove(
  gameId: string,
  move: GameMove
): Promise<GameRecord | undefined> {
  const result = await query<GameRecord>(
    `UPDATE games
     SET moves = moves || $1::jsonb
     WHERE id = $2
     RETURNING id, player1_name, player2_name, winner, moves, created_at, completed_at, game_name, time_spent`,
    [JSON.stringify([move]), gameId]
  );
  return result.rows[0];
}

export async function completeGame(
  gameId: string,
  winner: 'X' | 'O' | 'D'
): Promise<GameRecord | undefined> {
  const result = await query<GameRecord>(
    `UPDATE games
     SET winner = $1, completed_at = NOW()
     WHERE id = $2
     RETURNING id, player1_name, player2_name, winner, moves, created_at, completed_at, game_name, time_spent`,
    [winner, gameId]
  );
  return result.rows[0];
}
