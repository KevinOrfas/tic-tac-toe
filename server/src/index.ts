import { createServer } from './server.js';
import { setupSocketServer } from './socket.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = createServer();
setupSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.io server ready`);
});
