-- Add gameName and timeSpent columns to support existing API
ALTER TABLE games ADD COLUMN IF NOT EXISTS game_name VARCHAR(255);
ALTER TABLE games ADD COLUMN IF NOT EXISTS time_spent VARCHAR(50);
