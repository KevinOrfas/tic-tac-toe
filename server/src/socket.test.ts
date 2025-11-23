import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { createServer } from './server.js';
import { setupSocketServer } from './socket.js';
import { startTestServer, stopTestServer } from './testHelpers.js';

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
});
