import { type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useState } from 'react';
import { SocketContext } from './SocketContextType';

const SOCKET_URL =
  import.meta.env.MODE === 'production'
    ? window.location.origin
    : 'http://localhost:3000';

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket] = useState<Socket>(() => io(SOCKET_URL));

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
