import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the app with title', () => {
    render(<App />);

    expect(screen.getByText(/Multiplayer Tic-Tac-Toe/i)).toBeInTheDocument();
  });

  it('renders New Game button', () => {
    render(<App />);

    const button = screen.getByRole('button', { name: /New Game/i });
    expect(button).toBeInTheDocument();
  });
});
