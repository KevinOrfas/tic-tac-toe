import http from 'node:http';

export async function startTestServer(server: http.Server): Promise<string> {
  return new Promise<string>((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      const port = address && typeof address === 'object' ? address.port : 3001;
      const url = `http://localhost:${port}`;
      resolve(url);
    });
  });
}

export async function stopTestServer(server: http.Server): Promise<void> {
  return new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
}
