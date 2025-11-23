import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameBoard } from './GameBoard.tsx';
import userEvent from '@testing-library/user-event';

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

  it('should handle click events and update the first selection with X', async () => {
    render(<GameBoard gameId="123" />);
    const [cell] = screen.getAllByRole('button');
    await userEvent.click(cell);
    expect(cell).toHaveTextContent('X');
  });

  it('should handle click events and update the second selection with O', async () => {
    render(<GameBoard gameId="123" />);
    const [cell1, cell2] = screen.getAllByRole('button');
    await userEvent.click(cell1);
    await userEvent.click(cell2);
    expect(cell2).toHaveTextContent('O');
  });

  it('should not allow multiple clicks on the same cell', async () => {
    render(<GameBoard gameId="123" />);
    const [cell1] = screen.getAllByRole('button');
    await userEvent.click(cell1);
    await userEvent.click(cell1);
    expect(cell1).toHaveTextContent('X');
  });
});
