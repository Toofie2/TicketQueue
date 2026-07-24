import { createApp } from './apiServer.js';

const PORT = process.env.PORT || 4000;

createApp().listen(PORT, () => {
  console.log(`QueueSmart API running on http://localhost:${PORT}`);
});
