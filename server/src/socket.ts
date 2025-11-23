import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { randomUUID } from 'node:crypto';

interface Player {
  socketId: string;
  playerName: string;
  playerNumber: number;
}

interface GameRoom {
  id: string;
  players: Player[];
}

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
      const gameRoom: GameRoom = {
        id: gameId,
        players: [{ socketId: socket.id, playerName, playerNumber: 1 }],
      };

      gameRooms.set(gameId, gameRoom);
      socket.join(gameId);
      socket.emit('gameCreated', { gameId, playerNumber: 1 });
    });

    socket.on('joinGame', ({ gameId, playerName }: JoinGameData) => {
      const gameRoom = gameRooms.get(gameId);

      if (!gameRoom) {
        const error: ErrorResponse = { message: 'Game not found' };
        socket.emit('error', error);
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
        const error: ErrorResponse = { message: 'Game is full' };
        socket.emit('error', error);
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

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
