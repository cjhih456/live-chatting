import { setupWorker } from 'msw/browser';
import { createHandlers } from './handlers';

export async function startBrowserWorker() {
  const handlers = createHandlers();
  const worker = setupWorker(...handlers);
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
  return worker;
}
