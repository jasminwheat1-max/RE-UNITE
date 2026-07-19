import serverless from 'serverless-http';
import { app } from '../server/app.js';
import { initDb } from '../server/db.js';

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

const handler = serverless(app);

export default async function (req, res) {
  if (req.url === '/api/ping') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ pong: true, now: Date.now() }));
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
  return handler(req, res);
}
