#!/usr/bin/env bash
# Ensures the application database exists on a local (non-Docker) PostgreSQL server.
# PostgreSQL must already be installed and running on your machine.
# This script does NOT use Docker.

# TO RUN:
# 1. Install and start PostgreSQL locally (e.g. system PostgreSQL or Postgres.app).
# 2. Set DATABASE_URL in .env (e.g. postgresql://postgres:password@localhost:5432/genie).
# 3. Run this script: ./start-database.sh

set -e

echo "Checking database setup (no Docker)..."

# Load DATABASE_URL from .env if present
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Please set it in .env (e.g. postgresql://postgres:password@localhost:5433/genie)"
  exit 1
fi

# Ensure the database exists (create if missing) and connect
npm run db:ensure

echo "Database is ready. Run 'npm run db:push' or 'npm run db:migrate' to apply schema, then 'npm run dev' to start the app."
