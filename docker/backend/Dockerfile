# Development Stage
FROM oven/bun:1.2.2-alpine AS development

# Set working directory
WORKDIR /app

# Install dependencies for building native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy application code
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Expose port
EXPOSE 18787

# Start development server
CMD ["bun", "run", "dev"]

# Production Stage
FROM oven/bun:1.2.2-alpine AS production

WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy application code
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Build the application
RUN bun run build

# Expose port
EXPOSE 18787

# Start production server
CMD ["bun", "run", "start"]
