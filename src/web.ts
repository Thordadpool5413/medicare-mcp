#!/usr/bin/env node

import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_PORT = Number(process.env.APP_PORT || process.env.PORT || 8080);
const API_PORT = Number(process.env.API_PORT || 3000);
const API_BASE_URL = process.env.MEDICARE_API_URL || `http://127.0.0.1:${API_PORT}`;
const SHOULD_START_API = process.env.START_EMBEDDED_API !== 'false' && !process.env.MEDICARE_API_URL;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

let embeddedApi: ChildProcessWithoutNullStreams | null = null;

function log(message: string, meta?: Record<string, unknown>) {
  const payload = { timestamp: new Date().toISOString(), message, ...(meta || {}) };
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForApi(maxAttempts = 40) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) return;
    } catch {
      // Embedded API may still be starting.
    }
    await sleep(250);
  }
  throw new Error(`Medicare API did not become ready at ${API_BASE_URL}`);
}

function startEmbeddedApi() {
  if (!SHOULD_START_API) return;

  const apiEntry = path.join(__dirname, 'index.js');
  embeddedApi = spawn(process.execPath, ['-r', 'dotenv/config', apiEntry], {
    env: {
      ...process.env,
      USE_HTTP: 'true',
      PORT: String(API_PORT)
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  embeddedApi.stdout.on('data', (data) => process.stdout.write(`[medicare-api] ${data}`));
  embeddedApi.stderr.on('data', (data) => process.stderr.write(`[medicare-api] ${data}`));

  embeddedApi.on('exit', (code, signal) => {
    if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGINT') {
      log('Embedded Medicare API exited unexpectedly.', { code, signal });
    }
  });
}

async function proxyJson(req: Request, res: Response, pathName: string) {
  try {
    const response = await fetch(`${API_BASE_URL}${pathName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });
    const text = await response.text();
    res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(text);
  } catch (error) {
    res.status(502).json({ error: 'Unable to reach Medicare API.', detail: error instanceof Error ? error.message : String(error) });
  }
}

async function main() {
  startEmbeddedApi();
  await waitForApi();

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      res.json({ app: 'ok', medicareApi: data, apiBaseUrl: API_BASE_URL });
    } catch (error) {
      res.status(502).json({ app: 'ok', medicareApi: 'unavailable', error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post('/api/list-tools', (req: Request, res: Response) => proxyJson(req, res, '/list_tools'));
  app.post('/api/medicare-info', (req: Request, res: Response) => proxyJson(req, res, '/medicare_info'));

  app.use(express.static(PUBLIC_DIR, { extensions: ['html'], maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
  app.get('*', (_req: Request, res: Response) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

  const server = app.listen(APP_PORT, () => {
    log('Medicare Intelligence Console is running.', { appUrl: `http://localhost:${APP_PORT}`, apiBaseUrl: API_BASE_URL, embeddedApi: SHOULD_START_API });
  });

  const shutdown = () => {
    server.close(() => {
      if (embeddedApi) embeddedApi.kill('SIGTERM');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  process.stderr.write(`${JSON.stringify({ timestamp: new Date().toISOString(), error: error instanceof Error ? error.message : String(error) })}\n`);
  if (embeddedApi) embeddedApi.kill('SIGTERM');
  process.exit(1);
});
