import { createServer } from './server.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = createServer();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
