#!/bin/sh
# Rebuild shared package inside container and trigger NestJS hot reload
docker exec cria-viva-api sh -c "cd /app && yarn workspace @cria-viva/shared build"
touch apps/api/src/main.ts
echo "Shared package rebuilt."
