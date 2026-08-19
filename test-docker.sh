#!/bin/bash

echo "=== KodeDock Docker Test Script ==="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running"
    exit 1
fi

echo "✓ Docker is running"

# Build all services
echo ""
echo "Building all services..."
docker-compose build --quiet 2>&1

if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi

echo "✓ All services built successfully"

# Start services
echo ""
echo "Starting services..."
docker-compose up -d 2>&1

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start services"
    exit 1
fi

echo "✓ All services started"

# Wait for services to be ready
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check health endpoints
echo ""
echo "Checking health endpoints..."

services=(
    "Frontend|http://localhost:3000"
    "Core Engine|http://localhost:4001/health"
    "AI Service|http://localhost:4002/health"
    "Real-Time|http://localhost:4004/health"
)

all_ok=true

for service in "${services[@]}"; do
    IFS='|' read -r name url <<< "$service"
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo "✓ $name is healthy"
    else
        echo "✗ $name is not responding"
        all_ok=false
    fi
done

# Check Redis
if docker-compose exec -T redis redis-cli ping 2>&1 | grep -q "PONG"; then
    echo "✓ Redis is healthy"
else
    echo "✗ Redis is not responding"
    all_ok=false
fi

echo ""
if [ "$all_ok" = true ]; then
    echo "=== All services are healthy! ==="
    echo ""
    echo "Access the app at: http://localhost:3000"
else
    echo "=== Some services have issues ==="
    echo ""
    echo "Check logs with: docker-compose logs -f"
fi
