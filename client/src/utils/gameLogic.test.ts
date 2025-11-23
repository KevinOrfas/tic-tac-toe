import { describe, it, expect } from 'vitest';
import { calculateWinner, type Cell, createEmptyBoard } from './gameLogic';

describe('calculateWinner', () => {
  it('should return null for an empty board', () => {
    const board: Cell[] = createEmptyBoard();
    expect(calculateWinner(board)).toBeNull();
  });

  it('should return null when there is no winner', () => {
    const board: Cell[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(calculateWinner(board)).toBeNull();
  });

  it('should detect winner in top row', () => {
    const board: Cell[] = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
    expect(calculateWinner(board)).toBe('X');
  });

  it('should detect winner in middle row', () => {
    const board: Cell[] = [null, null, null, 'X', 'X', 'X', 'O', 'O', null];
    expect(calculateWinner(board)).toBe('X');
  });

  it('should detect winner in bottom row', () => {
    const board: Cell[] = ['O', 'O', null, null, null, null, 'X', 'X', 'X'];
    expect(calculateWinner(board)).toBe('X');
  });

  it('should detect winner in left column', () => {
    const board: Cell[] = ['X', 'O', null, 'X', 'O', null, 'X', null, null];
    expect(calculateWinner(board)).toBe('X');
  });

  it('should detect winner in middle column', () => {
    const board: Cell[] = ['O', 'X', null, null, 'X', 'O', null, 'X', null];
    expect(calculateWinner(board)).toBe('X');
  });

  it('should detect winner in right column', () => {
    const board: Cell[] = [null, 'O', 'X', null, 'O', 'X', null, null, 'X'];
    expect(calculateWinner(board)).toBe('X');
  });

  it('should detect winner in diagonal from top-left to bottom-right', () => {
    const board: Cell[] = ['X', 'O', null, 'O', 'X', null, null, null, 'X'];
    expect(calculateWinner(board)).toBe('X');
  });

  it('should detect winner in diagonal from top-right to bottom-left', () => {
    const board: Cell[] = ['O', 'O', 'X', null, 'X', null, 'X', null, null];
    expect(calculateWinner(board)).toBe('X');
  });
});
