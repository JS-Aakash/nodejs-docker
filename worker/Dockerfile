# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (only for building)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose port
EXPOSE 3000

# Health check (requires curl in alpine, or simple node script if curl missing)
# Implementing a simple node health check script to avoid extra dependencies if possible, 
# but curl is standard. Let's start the server first.
# Using a simple nodejs healthcheck script is cleaner for alpine images.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').request({host:'localhost',port:3000,path:'/health'}, res => process.exit(res.statusCode === 200 ? 0 : 1)).end()"

# Start the application
CMD ["node", "dist/index.js"]
