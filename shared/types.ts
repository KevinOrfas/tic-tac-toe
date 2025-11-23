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
