-- Create games table to store game history
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY,
  player1_name VARCHAR(255) NOT NULL,
  player2_name VARCHAR(255),
  winner VARCHAR(1) CHECK (winner IN ('X', 'O', 'D')), -- X, O, or D for Draw
  moves JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries by completion time
CREATE INDEX IF NOT EXISTS idx_games_completed_at ON games(completed_at DESC);

-- Create index for player name searches
CREATE INDEX IF NOT EXISTS idx_games_player1_name ON games(player1_name);
CREATE INDEX IF NOT EXISTS idx_games_player2_name ON games(player2_name);
