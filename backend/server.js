require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

let server;

(async () => {
  try {
    await connectDB();
  } catch (err) {
    // Keep this console.error — it's a fatal startup failure
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }

  server = app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV} mode)`);
    }
  });
})();

// Graceful shutdown on unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.error('[UnhandledRejection]', err.name, err.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Graceful shutdown on uncaught exception
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err.name, err.message);
  process.exit(1);
});
