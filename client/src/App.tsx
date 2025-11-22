import './App.css';

function App() {
  const startGame = () => {
    console.log('start game');
  };
  return (
    <>
      <h1>Multiplayer Tic-Tac-Toe</h1>
      <button onClick={startGame}>New Game</button>
    </>
  );
}

export default App;
