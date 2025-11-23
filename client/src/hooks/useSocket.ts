import { useContext } from 'react';
import { SocketContext } from '../context/SocketContextType.ts';

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context.socket;
}
