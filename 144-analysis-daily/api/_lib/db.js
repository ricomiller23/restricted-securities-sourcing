// api/_lib/db.js — Neon PostgreSQL connection (same DB as filings-outreach-scout)
import pg from 'pg';
const { Pool } = pg;

let pool = null;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function query(sql, params) {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Ensure the filings_144 table exists
export async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS filings_144 (
      accession TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      enriched BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Index for fast lookups
  await query(`
    CREATE INDEX IF NOT EXISTS idx_filings_144_enriched ON filings_144 (enriched)
  `);
}
