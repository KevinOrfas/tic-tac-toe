# ADR 004: Docker Containerisation Strategy

## Status
Accepted

## Context
The application requires a consistent development and deployment environment across:
- PostgresSQL database
- Node.js server
- React client (built and served via nginx)

Without containerization, developers must:
- Install and configure PostgresSQL locally
- Manage correct Node.js versions
- Handle environment-specific configurations
- Face environment inconsistencies

Three deployment approaches were evaluated:
1. **Local installation** - Manual setup, inconsistent environments
2. **Docker for database only—**Partial solution, still requires local Node.js
3. **Full containerization—**All services in Docker with docker-compose orchestration

## Decision
**Full Docker containerisation** with docker-compose for all services.

### Architecture
```
docker-compose.yml orchestrates:
├── postgres    - PostgreSQL 16 Alpine
├── server      - Node.js 20 Alpine (multi-stage build)
└── client      - nginx Alpine (serves built React app)
```

### Network Strategy
**Bridge network** (`tictactoe-network`) enables inter-container communication:
- Server connects to a database via hostname `postgres` (not `localhost`)
- Client communicates with server via hostname `server`
- Services isolated from other Docker networks

### Build Strategy
**Multi-stage builds** for optimised production images:

**Server Dockerfile:**
- Stage 1 (builder): Install all deps, build TypeScript
- Stage 2 (production): Install production deps only, copy built files
- Result: Smaller image, faster deployments

**Client Dockerfile:**
- Stage 1 (builder): Install deps, build React with Vite
- Stage 2 (production): nginx serves static files
- Result: Minimal runtime, optimised delivery

### Rationale
- **Consistency**: Identical environments across dev/staging/production
- **Isolation**: Each service in a separate container
- **Portability**: Works on any machine with Docker
- **Single command deployment**: `docker compose up`
- **Development efficiency**: No PostgresSQL local installation required

### Alternatives Considered
- **Local PostgresSQL only in Docker**: Still requires Node.js version management, inconsistent environments
- **No Docker**: Simple initially but creates environment drift, difficult onboarding

## Consequences

### Benefits
- Consistent development environment for all contributors
- Simplified onboarding (install Docker, run `docker compose up`)
- Production-like environment locally
- Easy CI/CD integration
- Database persists via Docker volumes

### Limitations
- Requires Docker Desktop installation
- Initial build time (~2–5 minutes first run)
- Port conflicts require configuration (e.g. PostgresSQL on 5433 instead of 5432)
- npm package-lock.json must stay in sync for `npm ci` to work

### Trade-offs
- Build complexity vs environment consistency: Accepted for reliability
- Docker resource usage vs manual setup: Accepted for portability
- Learning curve for Docker newcomers: Mitigated by docker-compose simplicity

## Implementation
```
### Port Mapping
- `5433:5432` - PostgreSQL (5433 to avoid conflicts with local installs)
- `3000:3000` - Server API
- `80:80` - Client (nginx)

### Environment Variables
Server receives database connection via docker-compose environment:
```yaml
DB_HOST: postgres       # Container name, not localhost
DB_PORT: 5432           # Internal port
```

### Volume Persistence
Database data persists across container restarts:
```yaml
volumes:
  postgres_data:
```

## Date
2025-11-23
