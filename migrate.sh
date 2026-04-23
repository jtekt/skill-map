#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "Running migrations..."
  npm run db:migrate
  echo "Migrations finished."
else
  echo "Skipping migrations."
fi
