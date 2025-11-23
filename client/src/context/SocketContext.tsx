import { type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useState } from 'react';
import { SocketContext } from './SocketContextType';

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket] = useState<Socket>(() => io('http://localhost:3000'));

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
