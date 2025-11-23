import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import type { GameResponse, MakeMoveData } from '@shared/types.js';

export function waitForSocketEvent<T>(
  socket: ClientSocket,
  eventName: string
): Promise<T> {
  return new Promise<T>((resolve) => {
    socket.on(eventName, (data?: T) => {
      resolve(data ?? ({} as unknown as T));
    });
  });
}

export async function createGame(
  socket: ClientSocket,
  playerName: string
): Promise<GameResponse> {
  socket.emit('createGame', { playerName });
  return waitForSocketEvent<GameResponse>(socket, 'gameCreated');
}

export async function joinGame(
  socket: ClientSocket,
  gameId: string,
  playerName: string
): Promise<GameResponse> {
  socket.emit('joinGame', { gameId, playerName });
  return waitForSocketEvent<GameResponse>(socket, 'gameJoined');
}

export async function makeMove(
  socket: ClientSocket,
  gameId: string,
  cellIndex: number
): Promise<MakeMoveData> {
  socket.emit('makeMove', { gameId, cellIndex });
  return waitForSocketEvent<MakeMoveData>(socket, 'moveMade');
}

export async function setupTwoPlayerGame(serverUrl: string): Promise<{
  socket1: ClientSocket;
  socket2: ClientSocket;
  gameId: string;
}> {
  const socket1 = ioClient(serverUrl);
  const socket2 = ioClient(serverUrl);

  const createData = await createGame(socket1, 'Player1');
  await joinGame(socket2, createData.gameId, 'Player2');

  return {
    socket1,
    socket2,
    gameId: createData.gameId,
  };
}
