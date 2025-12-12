# Evos API Server Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

# Copy package files first (for better caching)
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Copy all TypeScript source files explicitly
COPY ai.ts ./
COPY auth.ts ./
COPY db.ts ./
COPY email.ts ./
COPY env.ts ./
COPY index.ts ./

# Build TypeScript to JavaScript
RUN npm run build

# Verify build output exists and has the main file
RUN test -f dist/index.js || (echo "ERROR: dist/index.js not found after build" && ls -la dist/ && exit 1)

# Remove dev dependencies to reduce image size (keep only production deps)
RUN npm prune --production

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "dist/index.js"]


