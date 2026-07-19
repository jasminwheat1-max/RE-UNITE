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
  await ensureDb();
  return handler(req, res);
}
