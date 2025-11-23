export interface CreateGameData {
  playerName: string;
}

export interface JoinGameData {
  gameId: string;
  playerName: string;
}

export interface GameResponse {
  gameId: string;
  playerNumber: number;
}

export interface ErrorResponse {
  message: string;
}

export interface MakeMoveData {
  gameId: string;
  cellIndex: number;
  player: string;
}

interface Player {
  socketId: string;
  playerName: string;
  playerNumber: number;
}

export interface GameRoom {
  id: string;
  players: Player[];
}
