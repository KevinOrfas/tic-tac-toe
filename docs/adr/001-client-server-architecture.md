# ADR 001: Client-Server Architecture

## Status
Accepted

## Context
Multiplayer tic-tac-toe requires client interface and server-side state management for multiple concurrent games with shareable URLs.

Considered approaches:
- Full-stack frameworks (Next.js, Remix) - single deployment, SSR
- Separate client/server with frameworks (Express, Fastify) - common approach
- Separate client/server with minimal dependencies - lightweight

## Decision
Monorepo with separate client and server applications, no server framework.

```
tic-tac-toe/
├── client/          # React + Vite
├── server/          # Node.js http module + PostgreSQL
└── docs/
```

**Server**: Built with Node.js `http` module directly, no framework.

### API
Versioned REST endpoints (`/api/v1/`):
- `GET /api/v1/games` - List games
- `POST /api/v1/games` - Create game
- `GET /api/v1/games/:id` - Get game state
- `PATCH /api/v1/games/:id` - Update game state

### Communication
- HTTP/REST for CRUD operations
- WebSockets for real-time player moves
- Server holds authoritative state in PostgreSQL

### Testing
- **Client**: Mock `fetch` with `vi.fn()` for speed (may migrate to MSW)
- **Server**: Test actual endpoints against real database

## Rationale
- Independent deployment and scaling
- Clear API boundaries
- Technology flexibility
- Real-time multiplayer via WebSockets

## Trade-offs
- Two applications to deploy vs single full-stack app
- CORS configuration required
- Must handle WebSocket connection failures

## Date
2025-11-22
