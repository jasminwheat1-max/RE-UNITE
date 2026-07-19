import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import offerRoutes from './routes/offers.js';
import collaborationRoutes from './routes/collaborations.js';
import postRoutes from './routes/posts.js';

const IS_PROD = process.env.NODE_ENV === 'production';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const PgSession = connectPgSimple(session);

export const app = express();

app.set('trust proxy', 1); // needed for secure cookies behind any platform's proxy

app.use(express.json());
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(
  session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // Cross-site cookies (client and server on different domains) require
      // SameSite=None + Secure; same-origin dev via the Vite proxy is fine with Lax.
      sameSite: IS_PROD ? 'none' : 'lax',
      secure: IS_PROD,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/posts', postRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));
