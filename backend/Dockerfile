FROM node:20-alpine AS builder

WORKDIR /app

# Copy configuration files
COPY package*.json nx.json ./
COPY backend/package.json ./backend/

# Install dependencies
RUN npm ci

# Copy source and build
COPY backend ./backend
RUN npx nx build @message-x/backend --configuration=production
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/docker-entrypoint.sh ./

# Install production dependencies
RUN npm install --omit=dev

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]
