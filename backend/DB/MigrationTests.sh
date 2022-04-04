#!/bin/sh

# This test verifies that all our migrations and seeds work together properly and can
# create a functioning DB when executed in the correct order.

# Fail if any command fails
set -e

# Destroy any zombie containers from previous test runs
docker-compose -f ./backend/DB/docker-compose.tests.yml down -v

# Start up Postgres DB in background
docker-compose -f ./backend/DB/docker-compose.tests.yml up -d

until nc -z 127.0.0.1 8765
do
  echo "Waiting for postgres docker container to start up";
  sleep 0.2;
done;

# Unfortunately a bit more sleeping required before db is fully usable
sleep .5;

export NODE_ENV=db-tests

# Test that migrations and seeds don't throw errors and are self encapsulated / repeatable
pnpm exec sequelize db:migrate
pnpm exec sequelize db:seed:all
pnpm exec sequelize db:seed:undo:all
pnpm exec sequelize db:seed:all
pnpm exec sequelize db:seed:undo:all
pnpm exec sequelize db:migrate:undo:all

# Round 2 for good measure
pnpm exec sequelize db:migrate
pnpm exec sequelize db:seed:all
pnpm exec sequelize db:seed:undo:all
pnpm exec sequelize db:seed:all
pnpm exec sequelize db:seed:undo:all

echo "All migrations and seeds seem to work"

# Shut down and destroy all containers and volumes
docker-compose -f ./backend/DB/docker-compose.tests.yml down -v