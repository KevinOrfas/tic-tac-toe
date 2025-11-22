import './App.css';
import { GamesList, type ResponseShape } from './components/GamesList.tsx';
import { useEffect, useState } from 'react';

function App() {
  const [games, setGames] = useState<ResponseShape[]>([
    { id: '', winner: '', gameName: '', timeSpent: '' },
  ]);
  const startGame = () => {
    console.log('start game');
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
      <button onClick={startGame}>New Game</button>
      <GamesList gamesResult={games} />
    </>
  );
}

export default App;
