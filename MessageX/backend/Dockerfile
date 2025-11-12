# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from root (since we're building from project root)
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install all dependencies (including dev dependencies for building)
RUN npm install

# Copy entire project
COPY . .

# Build the backend application using Nx
RUN npx nx build @message-x/backend --configuration=production

# Generate Prisma client
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Expose port
EXPOSE 3000

# Set working directory to backend
WORKDIR /app/backend

# Start the application
CMD ["node", "dist/main.js"]
