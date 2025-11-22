import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameBoard } from './GameBoard.tsx';

describe('GameBoard', () => {
  it('renders a 3x3 grid of cells', () => {
    render(<GameBoard gameId="123" />);

    const grid = screen.getByTestId('game-grid');
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(9);
    expect(grid).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 100px)',
    });
  });
});
