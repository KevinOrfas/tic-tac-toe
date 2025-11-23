import { render } from '@testing-library/react';
import { SocketProvider } from '../context/SocketContext.tsx';
import type { ReactElement } from 'react';

export function renderWithSocket(component: ReactElement) {
  return render(<SocketProvider>{component}</SocketProvider>);
}
