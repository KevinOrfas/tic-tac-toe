# ADR 005: PostgreSQL Database Selection

## Status
Accepted

## Context
The application requires persistent storage for game history and state:
- Store game records with players, moves, and winners
- Query games by date for main page display
- Support concurrent multiplayer games
- Run in Docker containers

Considered alternatives:
- PostgreSQL with pg library
- PostgreSQL with ORM (Prisma, TypeORM)
- SQLite
- MongoDB

## Decision
Use **PostgreSQL 16** with native `pg` library (no ORM).

### Schema
Single `games` table with:
- `id` UUID PRIMARY KEY
- `player1_name` VARCHAR(255)
- `player2_name` VARCHAR(255)
- `winner` VARCHAR(1) with CHECK constraint ('X', 'O', 'D')
- `moves` JSONB (stores array of move objects)
- `created_at` TIMESTAMP WITH TIME ZONE
- `completed_at` TIMESTAMP WITH TIME ZONE

Indexes on `completed_at`, `player1_name`, `player2_name`.

### Repository Functions
Six functions in `gameRepository.ts`:
1. `createGame(gameId, player1Name)` - INSERT new game
2. `getGameById(gameId)` - SELECT single game
3. `getAllGames()` - SELECT all games ordered by date
4. `updatePlayer2(gameId, player2Name)` - UPDATE player 2
5. `addMove(gameId, move)` - UPDATE to append move to JSONB array
6. `completeGame(gameId, winner)` - UPDATE winner and completed_at

## Rationale

**PostgreSQL over SQLite**:
- Better concurrent write support for multiplayer
- Client-server model fits Docker architecture
- Connection pooling built-in

**JSONB for moves**:
- Max 9 moves per game (separate table unnecessary)
- Atomic array append with `moves || $1::jsonb`
- Single query returns complete game state

**Native pg over ORM**:
- Only 6 simple SQL queries (INSERT, SELECT, UPDATE)
- No joins or complex queries
- Direct control over SQL
- One dependency vs ORM + migrations + CLI
- Repository pattern provides sufficient abstraction

## Consequences

**Benefits**:
- Schema constraints enforce data integrity
- Connection pooling handles concurrent requests
- JSONB provides flexibility for move data
- Simple debugging (see actual SQL)

**Trade-offs**:
- Manual SQL queries vs ORM abstractions
- Manual migration files vs automated migrations
- Database server required (handled by Docker)

## Implementation
- Connection pool: `server/src/db.ts`
- Repository: `server/src/operations/gameRepository.ts`
- Migrations: `server/migrations/*.sql`
- Docker service on port 5433 with volume persistence

## Date
2025-11-24
