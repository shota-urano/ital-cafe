#!/bin/bash

# Setup script for Ital Cafe development environment

set -e

echo "🚀 Setting up Ital Cafe development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
fi

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec -T backend bunx prisma generate
docker-compose exec -T backend bunx prisma db push

echo "✅ Setup complete!"
echo ""
echo "📍 Access points:"
echo "   Frontend: http://localhost:13000"
echo "   Backend API: http://localhost:18787"
echo "   Database: localhost:15432"
echo ""
echo "📝 Next steps:"
echo "   1. Check logs: docker-compose logs -f"
echo "   2. Create initial user: docker-compose exec backend bun run seed (needs to be implemented)"
echo "   3. Open Prisma Studio: docker-compose exec backend bunx prisma studio"
