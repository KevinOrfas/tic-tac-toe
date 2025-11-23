import './App.css';
import { GamesList, type ResponseShape } from './components/GamesList.tsx';
import { useEffect, useState } from 'react';
import { Route, useLocation } from 'wouter';
import { GameBoard } from './components/GameBoard.tsx';
import { io, Socket } from 'socket.io-client';

function HomePage() {
  const [, setLocation] = useLocation();
  const [games, setGames] = useState<ResponseShape[]>([
    { id: '', winner: '', gameName: '', timeSpent: '' },
  ]);
  const [socket] = useState<Socket>(() => io('http://localhost:3000'));

  useEffect(() => {
    const handleConnect = () => {
      console.log('Connected to server');
    };

    const handleGameCreated = (data: {
      gameId: string;
      playerNumber: number;
    }) => {
      console.log('Game created:', data);
      setLocation(`/game/${data.gameId}`);
    };

    socket.on('connect', handleConnect);
    socket.on('gameCreated', handleGameCreated);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('gameCreated', handleGameCreated);
    };
  }, [socket, setLocation]);

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
    if (socket) {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit('createGame', { playerName: 'Player 1' });
      await createGame();
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

function App() {
  return (
    <>
      <Route path="/" component={HomePage} />
      <Route path="/game/:id">
        {(params) => <GameBoard gameId={params.id} />}
      </Route>
    </>
  );
}

export default App;
