import serverless from 'serverless-http';
import { app } from '../server/app.js';
import { initDb } from '../server/db.js';

let dbReady;
function ensureDb() {
  dbReady ??= initDb();
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
  await ensureDb();
  return handler(req, res);
}
