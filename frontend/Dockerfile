# Build stage
FROM node:20-alpine as build-stage

WORKDIR /app

# Copy root package.json and lock file if they exist, to leverage caching for monorepo structure if needed
# But since this is inside frontend context in the plan, let's assume we build from root context as per docker-compose
# The plan said "Build context set to `.`". So we have access to root.

# However, looking at the file structure, it seems to be an Nx workspace or similar monorepo?
# "nx.json" exists in root.
# But `frontend` has its own `package.json`.
# Let's try to build it as a standalone or part of the monorepo.
# The user's `frontend/package.json` has `nx build frontend` in scripts, suggesting it relies on nx.
# But it also has `build:prod`: `vite build --mode production`.
# Let's try to use the `package.json` inside `frontend` directly if possible to keep it simple, 
# OR copy the root files.
# Given `docker-compose` context is `.`, I can copy everything.

COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies. 
# Since it's a monorepo (likely), we might need to install root dependencies.
RUN npm install

# Copy the rest of the code
COPY . .

# Build the frontend
# We need to run the build command from the root or inside frontend?
# The `frontend/package.json` has `build:prod`. 
# If we are at root, we can run `npx nx build frontend` or similar.
# Or we can cd into frontend.
# Let's try to use the script defined in frontend package.json.
WORKDIR /app/frontend
RUN npm run build:prod

# Production stage
FROM nginx:alpine as production-stage

COPY --from=build-stage /app/frontend/dist /usr/share/nginx/html
COPY --from=build-stage /app/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
