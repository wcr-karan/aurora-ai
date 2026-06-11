# Helpdesk AI — production container.
# Works on any Node host (Render / Railway / Fly). For SQLite persistence,
# mount a volume at /data and set DATABASE_URL=file:/data/prod.db.
FROM node:22-slim

# Prisma needs openssl at runtime.
RUN apt-get update && apt-get install -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies (incl. dev — tsx is used to seed on first boot).
COPY package*.json ./
RUN npm ci

# Build.
COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:/data/prod.db"
EXPOSE 3000

# Entrypoint pushes the schema, seeds on first boot, then starts the server.
RUN chmod +x ./scripts/start.sh
CMD ["./scripts/start.sh"]
