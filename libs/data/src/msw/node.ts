import { setupServer } from 'msw/node';
import { createHandlers } from './handlers';
import { resetStore } from './store';

let server: ReturnType<typeof setupServer> | undefined;

export async function createMockServer() {
  resetStore();
  const handlers = createHandlers();
  server = setupServer(...handlers);
  return server;
}

export function getMockServer() {
  if (!server) {
    throw new Error('Mock server not created. Call createMockServer first.');
  }
  return server;
}
