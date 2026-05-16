import fetch, { RequestInit } from 'node-fetch';
import { randomUUID } from 'crypto';

type JsonRecord = Record<string, unknown>;

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const DEFAULT_OWNER_ID = process.env.SUPABASE_OWNER_ID || 'default';
const SAVED_VIEWS_TABLE = process.env.SUPABASE_SAVED_VIEWS_TABLE || 'medicare_saved_views';
const QUERY_RUNS_TABLE = process.env.SUPABASE_QUERY_RUNS_TABLE || 'medicare_query_runs';

function configured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function ownerId(value?: unknown) {
  const text = String(value || DEFAULT_OWNER_ID).trim();
  return text || DEFAULT_OWNER_ID;
}

function encodeFilterValue(value: string) {
  return encodeURIComponent(value).replace(/%2C/g, ',');
}

function parseJson(text: string) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function authHeaders(prefer?: string) {
  if (!configured()) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const requestHeaders: Record<string, string> = {
    apikey: SUPABASE_KEY,
    authorization: `Bearer ${SUPABASE_KEY}`,
    'content-type': 'application/json'
  };

  if (prefer) requestHeaders.prefer = prefer;
  return requestHeaders;
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}, prefer?: string): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: authHeaders(prefer)
  });

  const text = await response.text();
  const payload = parseJson(text);

  if (!response.ok) {
    throw new Error(`Supabase request failed with HTTP ${response.status}: ${typeof payload === 'string' ? payload : JSON.stringify(payload)}`);
  }

  return payload as T;
}

export function getSupabaseStatus() {
  return {
    configured: configured(),
    url: SUPABASE_URL ? new URL(SUPABASE_URL).host : null,
    savedViewsTable: SAVED_VIEWS_TABLE,
    queryRunsTable: QUERY_RUNS_TABLE
  };
}

export async function listSavedViews(inputOwnerId?: unknown) {
  const id = ownerId(inputOwnerId);
  return supabaseRequest<JsonRecord[]>(`${SAVED_VIEWS_TABLE}?owner_id=eq.${encodeFilterValue(id)}&order=updated_at.desc`, {
    method: 'GET'
  });
}

export async function saveSavedView(input: JsonRecord) {
  const now = new Date().toISOString();
  const id = String(input.id || randomUUID());
  const record = {
    id,
    owner_id: ownerId(input.owner_id || input.ownerId),
    name: String(input.name || 'Saved Medicare View'),
    module: String(input.module || input.method || 'search_providers'),
    dataset_id: input.dataset_id || input.datasetId || null,
    filters: input.filters || input.payload || input.request || {},
    created_at: input.created_at || now,
    updated_at: now
  };

  const result = await supabaseRequest<JsonRecord[]>(`${SAVED_VIEWS_TABLE}?on_conflict=id`, {
    method: 'POST',
    body: JSON.stringify(record)
  }, 'resolution=merge-duplicates,return=representation');

  return Array.isArray(result) ? result[0] : result;
}

export async function deleteSavedView(id: string, inputOwnerId?: unknown) {
  const cleanId = encodeFilterValue(id);
  const cleanOwnerId = encodeFilterValue(ownerId(inputOwnerId));
  await supabaseRequest(`${SAVED_VIEWS_TABLE}?id=eq.${cleanId}&owner_id=eq.${cleanOwnerId}`, {
    method: 'DELETE'
  }, 'return=minimal');
  return { id, deleted: true };
}

export async function recordQueryRun(input: {
  ownerId?: unknown;
  request: JsonRecord;
  response: unknown;
  statusCode: number;
  ok: boolean;
}) {
  if (!configured()) return { stored: false, reason: 'Supabase is not configured.' };

  const responseObject = input.response && typeof input.response === 'object' ? input.response as JsonRecord : {};
  const possibleRows = responseObject.results || responseObject.providers || responseObject.prescribers || responseObject.hospitals || responseObject.spending || responseObject.formulary;
  const rowCount = Array.isArray(possibleRows) ? possibleRows.length : undefined;

  const record = {
    id: randomUUID(),
    owner_id: ownerId(input.ownerId),
    method: String(input.request.method || 'unknown'),
    dataset_id: input.request.dataset_id || input.request.datasetId || null,
    request: input.request,
    response: input.response,
    row_count: rowCount,
    status_code: input.statusCode,
    ok: input.ok,
    created_at: new Date().toISOString()
  };

  const result = await supabaseRequest<JsonRecord[]>(QUERY_RUNS_TABLE, {
    method: 'POST',
    body: JSON.stringify(record)
  }, 'return=representation');

  return Array.isArray(result) ? result[0] : result;
}
