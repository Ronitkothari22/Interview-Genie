#!/usr/bin/env node
/**
 * Ensures the PostgreSQL database from DATABASE_URL exists.
 * Connects to the default "postgres" database and creates the target DB if missing.
 * Does not use Docker - expects PostgreSQL to be running locally or at DATABASE_URL host.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Client } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

function loadDatabaseUrl(): string | null {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const envPath = join(rootDir, ".env");
    const content = readFileSync(envPath, "utf8");
    const match = content.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\s#]+)["']?/m);
    if (match && match[1]) return match[1].trim();
  } catch {
    // .env missing or unreadable
  }
  return null;
}

interface ParsedDbUrl {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

function parseDatabaseUrl(url: string): ParsedDbUrl | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "postgresql:" && u.protocol !== "postgres:") return null;
    const dbName = u.pathname.slice(1).replace(/%2F/gi, "/") || "postgres";
    return {
      host: u.hostname || "localhost",
      port: Number(u.port) || 5432,
      user: decodeURIComponent(u.username) || "postgres",
      password: decodeURIComponent(u.password) || "",
      database: dbName,
    };
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const databaseUrl = loadDatabaseUrl();
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Set it in .env or the environment.");
    process.exit(1);
  }

  const parsed = parseDatabaseUrl(databaseUrl);
  if (!parsed) {
    console.error(
      "Invalid DATABASE_URL format. Use postgresql://user:password@host:port/dbname"
    );
    process.exit(1);
  }

  if (parsed.database === "postgres") {
    console.log(
      "DATABASE_URL already points to default database 'postgres'. Nothing to create."
    );
    process.exit(0);
  }

  const client = new Client({
    host: parsed.host,
    port: parsed.port,
    user: parsed.user,
    password: parsed.password,
    database: "postgres",
  });

  try {
    await client.connect();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      "Could not connect to PostgreSQL at %s:%s. Is PostgreSQL running?",
      parsed.host,
      parsed.port
    );
    console.error(message);
    process.exit(1);
  }

  try {
    const {
      rows: [row],
    } = await client.query("SELECT 1 AS exists FROM pg_database WHERE datname = $1", [
      parsed.database,
    ]);

    if (row?.exists === 1) {
      console.log("Database '%s' already exists.", parsed.database);
      await client.end();
      process.exit(0);
    }

    await client.query(`CREATE DATABASE "${parsed.database.replace(/"/g, '""')}"`);
    console.log("Database '%s' created successfully.", parsed.database);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to ensure database:", message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
