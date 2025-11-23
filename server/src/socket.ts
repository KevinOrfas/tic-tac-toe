import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { randomUUID } from 'node:crypto';

interface GameRoom {
  id: string;
  players: { socketId: string; playerName: string; playerNumber: number }[];
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
    socket.on('createGame', ({ playerName }: { playerName: string }) => {
      const gameId = randomUUID();
      const gameRoom: GameRoom = {
        id: gameId,
        players: [{ socketId: socket.id, playerName, playerNumber: 1 }],
      };

      gameRooms.set(gameId, gameRoom);
      socket.join(gameId);

      socket.emit('gameCreated', { gameId, playerNumber: 1 });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
