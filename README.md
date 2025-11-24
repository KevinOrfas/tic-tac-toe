# Multiplayer Tic-Tac-Toe

## Requirements

- **Main page**: Show a list of past games with their winner (Player 1, Player 2, or Draw) and a "Start Game" button.
- **Start game**: When the first player clicks, wait for a second player to join.
- **Gameplay**: Once both players are connected, they play in real time (moves visible instantly).
- **Finish**: When the game ends, show the winner and redirect both players back to the main page.
- **Auto-update**: The main page should update automatically with the new result.

## Available Scripts

- `npm run dev` - Start both client and server in development mode concurrently
- `npm run build` - Build both server and client for production
- `npm test` - Run tests for both server and client
- `npm run test:server` - Run server tests only
- `npm run test:client` - Run client tests only
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting with Prettier

### Docker Workflow

#### Development Mode (with hot reload)
```bash
# Start all services with hot reload
docker compose -f docker-compose.dev.yml up

# Run in background
docker compose -f docker-compose.dev.yml up -d

# Stop services
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f
```

Access the application:
- Client: http://localhost:5173 (Vite dev server)
- Server: http://localhost:3000
- PostgreSQL: localhost:5433

#### Production Mode (optimised builds)
```bash
# Build and start all services
docker compose up --build

# Run in background
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f server
```

Access the application:
- Client: http://localhost:80 (nginx)
- Server: http://localhost:3000
- PostgreSQL: localhost:5433

#### Common Docker Commands
```bash
# Build images without starting
docker compose build

# Restart a specific service
docker compose restart server

# View running containers
docker compose ps

# Remove containers and volumes
docker compose down -v
```