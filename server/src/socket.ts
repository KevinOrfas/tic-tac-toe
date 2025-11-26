import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { randomUUID } from 'node:crypto';
import type {
  CreateGameData,
  GameRoom,
  JoinGameData,
  MakeMoveData,
} from '@shared/types.js';
import {
  createGame,
  updatePlayer2,
  addMove,
  completeGame,
} from './operations/index.js';

const gameRooms = new Map<string, GameRoom>();
const onlineUsers = new Map<string, { socketId: string; nickname: string }>();

export function setupSocketServer(httpServer: http.Server): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    const userList = Array.from(onlineUsers.values()).map((u) => u.nickname);
    socket.emit('onlineUsers', userList);

    socket.on('createGame', async ({ playerName }: CreateGameData) => {
      const gameId = randomUUID();

      await createGame(gameId, playerName, `Game by ${playerName}`);

      onlineUsers.set(socket.id, { socketId: socket.id, nickname: playerName });
      const userList = Array.from(onlineUsers.values()).map((u) => u.nickname);
      io.emit('onlineUsers', userList);

      gameRooms.set(gameId, {
        id: gameId,
        players: [{ socketId: socket.id, playerName, playerNumber: 1 }],
        currentTurn: 1,
      });
      socket.join(gameId);
      socket.emit('gameCreated', { gameId, playerNumber: 1 });
    });

    socket.on('joinGame', async ({ gameId, playerName }: JoinGameData) => {
      onlineUsers.set(socket.id, { socketId: socket.id, nickname: playerName });
      const userList = Array.from(onlineUsers.values()).map((u) => u.nickname);
      io.emit('onlineUsers', userList);

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
      io.to(gameId).emit('bothPlayersJoined');

      await updatePlayer2(gameId, playerName);
    });

    socket.on(
      'updateNickname',
      async ({
        gameId,
        playerName,
      }: {
        gameId: string;
        playerName: string;
      }) => {
        const gameRoom = gameRooms.get(gameId);
        if (!gameRoom) {
          return;
        }

        const player = gameRoom.players.find((p) => p.socketId === socket.id);
        if (player) {
          player.playerName = playerName;

          if (player.playerNumber === 2) {
            await updatePlayer2(gameId, playerName);
          }

          onlineUsers.set(socket.id, {
            socketId: socket.id,
            nickname: playerName,
          });
          const userList = Array.from(onlineUsers.values()).map(
            (u) => u.nickname
          );
          io.emit('onlineUsers', userList);
        }
      }
    );

    socket.on('makeMove', async ({ gameId, cellIndex }: MakeMoveData) => {
      const gameRoom = gameRooms.get(gameId);

      if (!gameRoom) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const movingPlayer = gameRoom.players.find(
        (p) => p.socketId === socket.id
      );

      if (!movingPlayer) {
        socket.emit('error', { message: 'You are not in this game' });
        return;
      }

      if (movingPlayer.playerNumber !== gameRoom.currentTurn) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      const player = movingPlayer.playerNumber === 1 ? 'X' : 'O';
      gameRoom.currentTurn = gameRoom.currentTurn === 1 ? 2 : 1;

      await addMove(gameId, { cellIndex, player });

      io.to(gameId).emit('moveMade', { cellIndex, player });
    });

    socket.on(
      'gameEnded',
      async ({
        gameId,
        winner,
        isDraw,
      }: {
        gameId: string;
        winner: 'X' | 'O' | null;
        isDraw: boolean;
      }) => {
        const finalWinner = isDraw ? 'D' : winner;
        if (finalWinner) {
          await completeGame(gameId, finalWinner);
          io.to(gameId).emit('gameOver');
        }
      }
    );

    socket.on('disconnect', () => {
      // Remove user from online users list
      onlineUsers.delete(socket.id);
      const userList = Array.from(onlineUsers.values()).map((u) => u.nickname);
      io.emit('onlineUsers', userList);

      for (const [gameId, gameRoom] of gameRooms.entries()) {
        const disconnectedPlayer = gameRoom.players.find(
          (p) => p.socketId === socket.id
        );

        if (disconnectedPlayer) {
          io.to(gameId).emit('playerDisconnected', {
            playerNumber: disconnectedPlayer.playerNumber,
            playerName: disconnectedPlayer.playerName,
          });
          break;
        }
      }
    });
  });

  return io;
}
