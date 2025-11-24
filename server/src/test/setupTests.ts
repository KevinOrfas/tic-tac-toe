import { beforeAll } from 'vitest';
import { pool } from '../db.js';

beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS games (
      id UUID PRIMARY KEY,
      player1_name VARCHAR(255) NOT NULL,
      player2_name VARCHAR(255),
      winner VARCHAR(1) CHECK (winner IN ('X', 'O', 'D')),
      moves JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE,
      game_name VARCHAR(255),
      time_spent VARCHAR(50)
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_games_completed_at ON games(completed_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_games_player1_name ON games(player1_name);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_games_player2_name ON games(player2_name);
  `);
});
