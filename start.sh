#!/bin/sh
set -e

echo "🔄 Checking database connection..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "🔄 Running database migrations..."
npm run db:migrate || {
  echo "⚠️  Warning: Migration failed, continuing anyway..."
}

echo "🚀 Starting application..."
exec node .output/server/index.mjs

