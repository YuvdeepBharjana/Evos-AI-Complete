# Evos API Server Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

# Copy package files
COPY package.json package-lock.json tsconfig.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY ai.ts auth.ts db.ts email.ts env.ts index.ts ./

# Build TypeScript
RUN npm run build

# Verify dist/index.js exists
RUN test -f dist/index.js || (echo "Build failed: dist/index.js missing" && ls -la && exit 1)

# Remove dev dependencies
RUN npm prune --production

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Health check (using node since wget may not be available)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/index.js"]
