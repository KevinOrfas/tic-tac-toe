import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { createServer } from './server.js';
import { setupSocketServer } from './socket.js';
import { startTestServer, stopTestServer } from './testHelpers.js';
import type { GameResponse } from '@shared/types.js';

describe('Socket.io Server', () => {
  let httpServer: http.Server;
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

    await new Promise<void>((resolve) => {
      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        resolve();
      });
    });
  });

  it('should allow a player to create a game room', async () => {
    const socket = ioClient(serverUrl);

    socket.emit('createGame', { playerName: 'Player1' });

    const data = await new Promise<GameResponse>((resolve) => {
      socket.on('gameCreated', (data: GameResponse) => {
        resolve(data);
      });
    });

    expect(data).toHaveProperty('gameId');
    expect(data.playerNumber).toBe(1);
    socket.disconnect();
  });

  it('should allow a second player to join an existing game', async () => {
    const socket1 = ioClient(serverUrl);
    const socket2 = ioClient(serverUrl);

    socket1.emit('createGame', { playerName: 'Player1' });

    const createData = await new Promise<GameResponse>((resolve) => {
      socket1.on('gameCreated', (data: GameResponse) => {
        resolve(data);
      });
    });

    socket2.emit('joinGame', {
      gameId: createData.gameId,
      playerName: 'Player2',
    });

    const joinData = await new Promise<GameResponse>((resolve) => {
      socket2.on('gameJoined', (data: GameResponse) => {
        resolve(data);
      });
    });

    expect(joinData.gameId).toBe(createData.gameId);
    expect(joinData.playerNumber).toBe(2);

    socket1.disconnect();
    socket2.disconnect();
  });

  it('should broadcast move to all players in the game', async () => {
    const socket1 = ioClient(serverUrl);
    const socket2 = ioClient(serverUrl);

    socket1.emit('createGame', { playerName: 'Player1' });

    const createData = await new Promise<GameResponse>((resolve) => {
      socket1.on('gameCreated', (data: GameResponse) => {
        resolve(data);
      });
    });

    socket2.emit('joinGame', {
      gameId: createData.gameId,
      playerName: 'Player2',
    });

    await new Promise<GameResponse>((resolve) => {
      socket2.on('gameJoined', (data: GameResponse) => {
        resolve(data);
      });
    });

    socket1.emit('makeMove', {
      gameId: createData.gameId,
      cellIndex: 0,
      player: 'X',
    });

    const player1Move = await new Promise<{
      cellIndex: number;
      player: string;
    }>((resolve) => {
      socket1.on('moveMade', (data) => {
        resolve(data);
      });
    });

    const player2Move = await new Promise<{
      cellIndex: number;
      player: string;
    }>((resolve) => {
      socket2.on('moveMade', (data) => {
        resolve(data);
      });
    });

    expect(player1Move.cellIndex).toBe(0);
    expect(player1Move.player).toBe('X');
    expect(player2Move.cellIndex).toBe(0);
    expect(player2Move.player).toBe('X');

    socket1.disconnect();
    socket2.disconnect();
  });

  it('should reject move when it is not the players turn', async () => {
    const socket1 = ioClient(serverUrl);
    const socket2 = ioClient(serverUrl);

    socket1.emit('createGame', { playerName: 'Player1' });

    const createData = await new Promise<GameResponse>((resolve) => {
      socket1.on('gameCreated', (data: GameResponse) => {
        resolve(data);
      });
    });

    socket2.emit('joinGame', {
      gameId: createData.gameId,
      playerName: 'Player2',
    });

    await new Promise<GameResponse>((resolve) => {
      socket2.on('gameJoined', (data: GameResponse) => {
        resolve(data);
      });
    });

    socket2.emit('makeMove', {
      gameId: createData.gameId,
      cellIndex: 0,
    });

    const error = await new Promise<{ message: string }>((resolve) => {
      socket2.on('error', (data) => {
        resolve(data);
      });
    });

    expect(error.message).toBe('Not your turn');

    socket1.disconnect();
    socket2.disconnect();
  });
});
