import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { randomUUID } from 'node:crypto';
import type {
  CreateGameData,
  GameRoom,
  JoinGameData,
  MakeMoveData,
} from '@shared/types.js';

const gameRooms = new Map<string, GameRoom>();

export function setupSocketServer(httpServer: http.Server): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('createGame', ({ playerName }: CreateGameData) => {
      const gameId = randomUUID();
      gameRooms.set(gameId, {
        id: gameId,
        players: [{ socketId: socket.id, playerName, playerNumber: 1 }],
      });
      socket.join(gameId);
      socket.emit('gameCreated', { gameId, playerNumber: 1 });
    });

    socket.on('joinGame', ({ gameId, playerName }: JoinGameData) => {
      const gameRoom = gameRooms.get(gameId);

      if (!gameRoom) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const existingPlayer = gameRoom.players.find(
        (p) => p.socketId === socket.id
      );
      if (existingPlayer) {
        socket.emit('gameJoined', {
          gameId,
          playerNumber: existingPlayer.playerNumber,
        });
        return;
      }

      if (gameRoom.players.length >= 2) {
        socket.emit('error', { message: 'Game is full' });
        return;
      }

      gameRoom.players.push({
        socketId: socket.id,
        playerName,
        playerNumber: 2,
      });
      socket.join(gameId);
      socket.emit('gameJoined', { gameId, playerNumber: 2 });
    });

    socket.on('makeMove', ({ gameId, cellIndex, player }: MakeMoveData) => {
      const gameRoom = gameRooms.get(gameId);

      if (!gameRoom) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      io.to(gameId).emit('moveMade', { cellIndex, player });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
