import './App.css';
import { GamesList, type ResponseShape } from './components/GamesList.tsx';
import { useEffect, useState } from 'react';

function App() {
  const [games, setGames] = useState<ResponseShape[]>([
    { id: '', winner: '', gameName: '', timeSpent: '' },
  ]);
  const createGame = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameName: 'Test Gamee' }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };
  const startGame = async () => {
    const game = await createGame();
    if (game) {
      setGames([...games, game]);
    }
  };
  const getGames = async () => {
    const response = await fetch('http://localhost:3000/api/v1/games');
    if (response.ok) {
      return await response.json();
    }
  };
  useEffect(() => {
    const fetchGames = async () => {
      const games = await getGames();
      if (games) {
        setGames(games);
      }
    };
    fetchGames();
  }, []);

  return (
    <>
      <h1>Multiplayer Tic-Tac-Toe</h1>
      <button type="button" onClick={startGame}>
        New Game
      </button>
      <GamesList gamesResult={games} />
    </>
  );
}

export default App;
