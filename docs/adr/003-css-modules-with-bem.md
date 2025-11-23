# ADR 003: CSS Modules with BEM Naming Convention

## Status
Accepted

## Context
The application requires a styling solution for React components. Initial implementation used inline styles, which created maintainability issues:
- No separation of concerns (styles coupled with component logic)
- Limited CSS features (no pseudo-classes, media queries, animations)
- Difficult to maintain consistent design system
- No clear naming conventions

Five styling approaches were evaluated:
1. **Inline styles** (current) - Simple but limited
2. **Plain CSS** - Global namespace, naming collisions
3. **CSS Modules** - Scoped styles, built into Vite
4. **Tailwind CSS** - Utility-first, requires setup
5. **CSS-in-JS** (styled-components, emotion) - Runtime overhead

## Decision
**CSS Modules with BEM (Block Element Modifier) naming convention.**

### Rationale
- **Zero configuration**: Built into Vite/React
- **Performance**: No runtime overhead unlike CSS-in-JS
- **Full CSS features**: Pseudo-classes, media queries, animations
- **Automatic scoping**: No global namespace pollution
- **BEM provides structure**: Clear, self-documenting class names

### Alternatives Considered
- **Tailwind CSS**: Popular but adds build complexity, verbose HTML, steeper learning curve
- **CSS-in-JS**: Additional dependencies, runtime cost, larger bundles
- **Plain CSS**: Manual scoping required, high risk of naming conflicts

## Consequences

### Benefits
- Separation of concerns (CSS in dedicated files)
- Scoped class names prevent collisions
- Standard CSS syntax with full feature set
- Clear component-style relationships via BEM
- Better performance than CSS-in-JS solutions

### Limitations
- Bracket notation required for hyphenated class names: `styles['game-board']`
- Manual BEM convention enforcement through code review
- Slightly more verbose than utility-first approaches

### Migration Path
If design system complexity grows significantly, consider migrating to Tailwind CSS for utility-first benefits or CSS-in-JS for tighter component integration.

## Implementation

### BEM Structure
```css
/* Block */
.game-board { }

/* Element */
.game-board__title { }
.game-board__layout { }

/* Modifier */
.player-info__badge--player-1 { }
.player-info__badge--player-2 { }
```

### Component Usage
```typescript
import styles from './GameBoard.module.css';

<div className={styles['game-board']}>
  <h1 className={styles['game-board__title']}>Tic-Tac-Toe</h1>
</div>
```

### Test Configuration
Vite config updated to support CSS modules in tests:
```typescript
test: {
  css: {
    modules: {
      classNameStrategy: 'non-scoped',
    },
  },
}
```

## Date
2025-11-23
