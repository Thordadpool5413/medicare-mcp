#!/usr/bin/env node

import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  deleteSavedView,
  getSupabaseStatus,
  listSavedViews,
  recordQueryRun,
  saveSavedView
} from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_PORT = Number(process.env.APP_PORT || process.env.PORT || 8080);
const API_PORT = Number(process.env.API_PORT || 3000);
const API_BASE_URL = process.env.MEDICARE_API_URL || `http://127.0.0.1:${API_PORT}`;
const SHOULD_START_API = process.env.START_EMBEDDED_API !== 'false' && !process.env.MEDICARE_API_URL;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

let embeddedApi: ChildProcess | null = null;

function log(message: string, meta?: Record<string, unknown>) {
  const payload = { timestamp: new Date().toISOString(), message, ...(meta || {}) };
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getOwnerId(req: Request) {
  const headerOwner = req.header('x-medicare-owner-id');
  const bodyOwner = req.body?.owner_id || req.body?.ownerId;
  return String(headerOwner || bodyOwner || process.env.SUPABASE_OWNER_ID || 'default');
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

  embeddedApi.stdout?.on('data', (data) => process.stdout.write(`[medicare-api] ${data}`));
  embeddedApi.stderr?.on('data', (data) => process.stderr.write(`[medicare-api] ${data}`));

  embeddedApi.on('exit', (code, signal) => {
    if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGINT') {
      log('Embedded Medicare API exited unexpectedly.', { code, signal });
    }
  });
}

async function proxyJson(req: Request, res: Response, pathName: string, options: { recordRun?: boolean } = {}) {
  let statusCode = 500;
  let responsePayload: unknown = null;

  try {
    const response = await fetch(`${API_BASE_URL}${pathName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });

    statusCode = response.status;
    const text = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';

    try {
      responsePayload = JSON.parse(text);
    } catch {
      responsePayload = { raw: text };
    }

    if (options.recordRun) {
      recordQueryRun({
        ownerId: getOwnerId(req),
        request: req.body || {},
        response: responsePayload,
        statusCode,
        ok: response.ok
      }).catch((error) => log('Supabase query run persistence failed.', { error: error instanceof Error ? error.message : String(error) }));
    }

    res.status(response.status).type(contentType).send(text);
  } catch (error) {
    statusCode = 502;
    responsePayload = { error: 'Unable to reach Medicare API.', detail: error instanceof Error ? error.message : String(error) };

    if (options.recordRun) {
      recordQueryRun({
        ownerId: getOwnerId(req),
        request: req.body || {},
        response: responsePayload,
        statusCode,
        ok: false
      }).catch((supabaseError) => log('Supabase query failure persistence failed.', { error: supabaseError instanceof Error ? supabaseError.message : String(supabaseError) }));
    }

    res.status(502).json(responsePayload);
  }
}

async function main() {
  startEmbeddedApi();
  await waitForApi();

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      res.json({ app: 'ok', medicareApi: data, apiBaseUrl: API_BASE_URL, supabase: getSupabaseStatus() });
    } catch (error) {
      res.status(502).json({ app: 'ok', medicareApi: 'unavailable', supabase: getSupabaseStatus(), error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get('/api/supabase/status', (_req: Request, res: Response) => {
    res.json(getSupabaseStatus());
  });

  app.get('/api/saved-views', async (req: Request, res: Response) => {
    try {
      const views = await listSavedViews(req.query.owner_id || req.query.ownerId || getOwnerId(req));
      res.json({ views });
    } catch (error) {
      res.status(500).json({ error: 'Unable to list saved views.', detail: error instanceof Error ? error.message : String(error), supabase: getSupabaseStatus() });
    }
  });

  app.post('/api/saved-views', async (req: Request, res: Response) => {
    try {
      const view = await saveSavedView({ ...req.body, owner_id: getOwnerId(req) });
      res.json({ view });
    } catch (error) {
      res.status(500).json({ error: 'Unable to save view.', detail: error instanceof Error ? error.message : String(error), supabase: getSupabaseStatus() });
    }
  });

  app.delete('/api/saved-views/:id', async (req: Request, res: Response) => {
    try {
      const result = await deleteSavedView(req.params.id, getOwnerId(req));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Unable to delete saved view.', detail: error instanceof Error ? error.message : String(error), supabase: getSupabaseStatus() });
    }
  });

  app.post('/api/list-tools', (req: Request, res: Response) => proxyJson(req, res, '/list_tools'));
  app.post('/api/medicare-info', (req: Request, res: Response) => proxyJson(req, res, '/medicare_info', { recordRun: true }));

  app.use(express.static(PUBLIC_DIR, { extensions: ['html'], maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
  app.get('*', (_req: Request, res: Response) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

  const server = app.listen(APP_PORT, () => {
    log('Medicare Intelligence Console is running.', { appUrl: `http://localhost:${APP_PORT}`, apiBaseUrl: API_BASE_URL, embeddedApi: SHOULD_START_API, supabase: getSupabaseStatus() });
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
