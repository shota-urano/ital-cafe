# Development Stage
FROM oven/bun:1.2.2-alpine AS development

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy application code
COPY . .

# Expose port
EXPOSE 13000

# Start development server
CMD ["bun", "run", "dev"]

# Production Stage
FROM oven/bun:1.2.2-alpine AS production

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json bun.lock ./

# Install dependencies (including dev for build)
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN bun run build

# Reinstall only production dependencies to slim runtime
RUN rm -rf node_modules && bun install --frozen-lockfile --production

# Expose port
EXPOSE 13000

# Start production server
CMD ["bun", "run", "start"]
