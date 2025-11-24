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
     ORDER BY created_at DESC`
  );
  return result.rows;
}
