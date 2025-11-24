import './App.css';
import { GamesList, type ResponseShape } from './components/GamesList.tsx';
import { useEffect, useState } from 'react';
import { Route, useLocation } from 'wouter';
import { GameBoard } from './components/GameBoard.tsx';
import { SocketProvider } from './context/SocketContext.tsx';
import { useSocket } from './hooks/useSocket.ts';

function HomePage() {
  const [, setLocation] = useLocation();
  const [games, setGames] = useState<ResponseShape[]>([
    { id: '', winner: '', gameName: '', timeSpent: '' },
  ]);
  const socket = useSocket();

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

  const startGame = async () => {
    if (socket) {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit('createGame', { playerName: 'Player 1' });
    }
  };

  const getGames = async () => {
    const response = await fetch('/api/v1/games');
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
    <SocketProvider>
      <Route path="/" component={HomePage} />
      <Route path="/game/:id">
        {(params) => <GameBoard gameId={params.id} />}
      </Route>
    </SocketProvider>
  );
}

export default App;
