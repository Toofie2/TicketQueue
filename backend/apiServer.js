import express from 'express';
import cors from 'cors';
import serviceRoutes from './routes/serviceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/events', eventRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/history', historyRoutes);

  return app;
}

export default createApp;
