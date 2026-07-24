// backend/server.js
// Express app wiring together the QueueSmart backend modules.

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const historyRoutes = require('./routes/historyRoutes');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/history', historyRoutes);

  return app;
}

const app = createApp();

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`QueueSmart backend listening on port ${PORT}`);
  });
}

module.exports = { app, createApp };
