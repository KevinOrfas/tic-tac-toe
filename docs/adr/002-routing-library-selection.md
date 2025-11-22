# ADR 001: Routing Library Selection

## Status
Accepted

## Context
The multiplayer tic-tac-toe application requires client-side routing to:
- Navigate between the game list (home page) and individual game boards
- Enable shareable game URLs so players can join the same game
- Support browser back/forward navigation
- Maintain game context via URL parameters

Three routing libraries were evaluated:
1. **React Router** - Most popular, ~13kb gzipped
2. **TanStack Router** - Fully type-safe, modern, ~12kb gzipped
3. **Wouter** - Minimal, ~2kb gzipped

## Decision
**Wouter** was selected.

### Rationale
- **Scope alignment**: Application has simple routing needs (2 routes: `/` and `/game/:id`)
- **Bundle size**: 2kb vs 13kb - significant savings for a lightweight application
- **Development velocity**: Hook-based API enables rapid iteration
- **Sufficient features**: Provides all required functionality without unnecessary complexity

### Alternatives Considered
- **React Router**: Industry standard but oversized for current requirements
- **TanStack Router**: Best TypeScript DX but complex setup for minimal routes

## Consequences

### Benefits
- Minimal bundle size impact
- Simple, maintainable routing code
- Fast implementation with `useLocation()` hook
- Zero configuration required

### Limitations
- Manual TypeScript typing for route parameters
- No built-in data loading patterns
- May require migration if routing complexity grows

### Migration Path
If the application scales to 5+ routes or requires complex data loading, migration to TanStack Router would provide better type safety and DX.

## Implementation
```typescript
/ - Game list (HomePage)
/game/:id - Game board (GameBoard)
```

Navigation handled via `useLocation()` hook:
```typescript
const [, setLocation] = useLocation();
setLocation(`/game/${gameId}`);
```

## Date
2025-11-22
