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

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').request({host:'localhost',port:3000,path:'/health'}, res => process.exit(res.statusCode === 200 ? 0 : 1)).end()"

# Start the application
CMD ["node", "dist/index.js"]
