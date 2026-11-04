import './config/env.js';
import http from 'node:http';
import { assertRuntimeConfig } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 5000);
let server;

async function start() {
  assertRuntimeConfig();
  await connectDatabase();
  const app = createApp();
  server = http.createServer(app);
  server.listen(port, '0.0.0.0', () => {
    console.log(`Velveteen API listening on 0.0.0.0:${port}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received; shutting down Velveteen API.`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  const mongoose = await import('mongoose');
  await mongoose.default.disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch((error) => {
  console.error(`API startup failed: ${error.message}`);
  process.exit(1);
});
