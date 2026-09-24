import { createServer, type IncomingMessage } from 'node:http';
import { getResponse } from 'msw';
import { createHandlers } from './handlers';
import { resetStore } from './store';

const port = Number(process.env.MOCK_PORT ?? 4010);
const handlers = createHandlers();

resetStore();

const cors: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
};

async function toRequest(req: IncomingMessage, host: string): Promise<Request> {
  const url = new URL(req.url ?? '/', `http://${host}`);
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const body = Buffer.concat(chunks);
  const method = req.method ?? 'GET';
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }
  return new Request(url, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' || body.length === 0 ? undefined : body,
  });
}

const server = createServer(async (req, res) => {
  const host = req.headers.host ?? `127.0.0.1:${port}`;
  const path = req.url?.split('?')[0] ?? '/';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  if (req.method === 'GET' && path === '/health') {
    res.writeHead(200, { ...cors, 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  try {
    const request = await toRequest(req, host);
    const response = await getResponse(handlers, request);
    if (!response) {
      res.writeHead(404, { ...cors, 'content-type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not found' }));
      return;
    }
    const payload = Buffer.from(await response.arrayBuffer());
    const headers: Record<string, string> = { ...cors };
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    res.writeHead(response.status, headers);
    res.end(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mock server error';
    res.writeHead(500, { ...cors, 'content-type': 'application/json' });
    res.end(JSON.stringify({ message }));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Mock API listening on http://127.0.0.1:${port}`);
});
