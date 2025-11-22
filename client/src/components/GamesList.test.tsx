import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GamesList } from './GamesList.tsx';

describe('App', () => {
  it('renders the app with title', () => {
    render(
      <GamesList
        gamesResult={[
          { winner: 'Player 1', id: '1', timeSpent: '', gameName: 'Santiago' },
        ]}
      />
    );

    expect(screen.getByText(/Santiago/i)).toBeInTheDocument();
  });
});
