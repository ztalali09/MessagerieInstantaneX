# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files from root (since we're building from project root)
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install all dependencies (including dev dependencies for building)
RUN npm install --no-audit --no-fund && npm cache clean --force

# Copy entire project
COPY . .

# Build the backend application using Nx
RUN npx nx build @message-x/backend --configuration=production

# Generate Prisma client
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Production stage
FROM node:20-alpine AS production

# Install only production dependencies
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/docker-entrypoint.sh ./backend/

# Install only production dependencies
WORKDIR /app/backend
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["./docker-entrypoint.sh"]
