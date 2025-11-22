import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';

describe('HTTP Server', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    const { createServer } = await import('./server.js');
    server = createServer();
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        const port =
          address && typeof address === 'object' ? address.port : 3001;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('should return health status', async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
  });
});
