import { app } from '../server/app.js';
import { initDb, pool } from '../server/db.js';

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

let dbReady = null;
function ensureDb() {
  if (!dbReady) {
    // Cache only success. A hung/failed attempt must not poison every later
    // request in this same warm container - clear it so the next call retries.
    dbReady = withTimeout(initDb(), 10000, 'initDb').catch((err) => {
      dbReady = null;
      throw err;
    });
  }
  return dbReady;
}

export default async function (req, res) {
  if (req.url === '/api/ping') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ pong: true, now: Date.now() }));
    return;
  }
  if (req.url === '/api/dbping') {
    const start = Date.now();
    try {
      const result = await withTimeout(pool.query('SELECT 1 as ok'), 8000, 'dbping');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, rows: result.rows, ms: Date.now() - start }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: err.message, ms: Date.now() - start }));
    }
    return;
  }
  try {
    await ensureDb();
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Database init failed', detail: err.message }));
    return;
  }
  // Vercel's Node runtime hands us real http.IncomingMessage/ServerResponse
  // objects - Express apps are already valid (req, res) handlers, so no
  // Lambda-style adapter (serverless-http) is needed, or wanted here.
  return app(req, res);
}
