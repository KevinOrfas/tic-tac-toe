import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { createServer } from './server.js';
import { setupSocketServer } from './socket.js';
import { startTestServer, stopTestServer } from './test/testHelpers.js';
import {
  createGame,
  joinGame,
  setupTwoPlayerGame,
  waitForSocketEvent,
} from './test/socketTestHelpers.js';

describe('Socket.io Server', () => {
  let httpServer: Server;
  let io: SocketIOServer;
  let serverUrl: string;
  let clientSocket: ClientSocket;

  beforeAll(async () => {
    httpServer = createServer();
    io = setupSocketServer(httpServer);
    serverUrl = await startTestServer(httpServer);
  });

  afterAll(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    if (io) {
      await io.close();
    }
    await stopTestServer(httpServer);
  });

  it('should establish a socket connection', async () => {
    clientSocket = ioClient(serverUrl);

    await waitForSocketEvent(clientSocket, 'connect');
    expect(clientSocket.connected).toBe(true);
  });

  it('should allow a player to create a game room', async () => {
    const socket = ioClient(serverUrl);

    const data = await createGame(socket, 'Player1');

    expect(data).toHaveProperty('gameId');
    expect(data.playerNumber).toBe(1);
    socket.disconnect();
  });

  it('should allow a second player to join an existing game', async () => {
    const socket1 = ioClient(serverUrl);
    const socket2 = ioClient(serverUrl);

    const createData = await createGame(socket1, 'Player1');
    const joinData = await joinGame(socket2, createData.gameId, 'Player2');

    expect(joinData.gameId).toBe(createData.gameId);
    expect(joinData.playerNumber).toBe(2);

    socket1.disconnect();
    socket2.disconnect();
  });

  it('should broadcast move to all players in the game', async () => {
    const { socket1, socket2, gameId } = await setupTwoPlayerGame(serverUrl);

    socket1.emit('makeMove', {
      gameId,
      cellIndex: 0,
      player: 'X',
    });

    const player1Move = await waitForSocketEvent<{
      cellIndex: number;
      player: string;
    }>(socket1, 'moveMade');

    const player2Move = await waitForSocketEvent<{
      cellIndex: number;
      player: string;
    }>(socket2, 'moveMade');

    expect(player1Move.cellIndex).toBe(0);
    expect(player1Move.player).toBe('X');
    expect(player2Move.cellIndex).toBe(0);
    expect(player2Move.player).toBe('X');

    socket1.disconnect();
    socket2.disconnect();
  });

  it('should reject move when it is not the players turn', async () => {
    const { socket1, socket2, gameId } = await setupTwoPlayerGame(serverUrl);

    socket2.emit('makeMove', {
      gameId,
      cellIndex: 0,
    });

    const error = await waitForSocketEvent<{ message: string }>(
      socket2,
      'error'
    );

    expect(error.message).toBe('Not your turn');

    socket1.disconnect();
    socket2.disconnect();
  });

  it('should notify other players when a player disconnects', async () => {
    const { socket1, socket2 } = await setupTwoPlayerGame(serverUrl);

    const disconnectPromise = waitForSocketEvent<{
      playerNumber: number;
      playerName: string;
    }>(socket2, 'playerDisconnected');

    socket1.disconnect();

    const disconnectData = await disconnectPromise;

    expect(disconnectData.playerNumber).toBe(1);
    expect(disconnectData.playerName).toBe('Player1');

    socket2.disconnect();
  });
});
