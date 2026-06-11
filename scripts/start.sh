#!/bin/sh
# Production entrypoint: ensure the schema exists, seed once if the DB is empty,
# then start Next.js. Safe to run on every boot.
set -e

# Create the data dir for SQLite if a volume is mounted there.
DB_DIR=$(dirname "$(echo "${DATABASE_URL#file:}" )")
mkdir -p "$DB_DIR" 2>/dev/null || true

echo "→ Applying database schema…"
npx prisma db push --skip-generate

COUNT=$(node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.business.count().then(c=>{console.log(c);return p.\$disconnect()}).catch(()=>{console.log(0)})")

if [ "$COUNT" = "0" ]; then
  echo "→ Empty database, seeding demo tenant…"
  npx tsx prisma/seed.ts || echo "seed skipped"
else
  echo "→ Database already has $COUNT business(es), skipping seed."
fi

echo "→ Starting server on port ${PORT:-3000}…"
exec npm run start
