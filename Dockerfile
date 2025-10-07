# Multi-stage build for Stremio Web
ARG NODE_VERSION=20-alpine
FROM node:$NODE_VERSION AS base

# Meta
LABEL Description="Stremio Web - Railway Optimized" \
      Vendor="Smart Code OOD" \
      Version="5.0.0-beta.27" \
      Maintainer="Railway Deployment"

# Set working directory
WORKDIR /app

# Install dependencies stage
FROM base AS deps
COPY package*.json ./
COPY pnpm-lock.yaml* ./
RUN apk add --no-cache git python3 make g++ && \
    npm install -g pnpm && \
    pnpm install --frozen-lockfile --production=false

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 stremio

# Copy built application
COPY --from=builder --chown=stremio:nodejs /app/dist ./dist
COPY --from=builder --chown=stremio:nodejs /app/server.js ./
COPY --from=builder --chown=stremio:nodejs /app/package.json ./

# Install only production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Switch to non-root user
USER stremio

# Expose port (Railway will override with $PORT)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start command
CMD ["node", "server.js"]
