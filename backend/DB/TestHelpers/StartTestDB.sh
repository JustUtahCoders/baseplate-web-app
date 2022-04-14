#!/bin/sh

# This script starts up a test postgres database inside a docker container,
# to be used in jest integration tests and in bash tests for sequelize migrations
# and seeds

# Fail if any command fails
set -e

# Destroy any zombie containers from previous test runs
docker-compose -f ./backend/DB/TestHelpers/docker-compose.tests.yml down -v

# Start up Postgres DB in background
docker-compose -f ./backend/DB/TestHelpers/docker-compose.tests.yml up -d

until nc -z 127.0.0.1 8765
do
  echo "Waiting for postgres docker container to start up";
  sleep 0.2;
done;

# Unfortunately a bit more sleeping required before db is fully usable
sleep .5;

export NODE_ENV=db-tests

pnpm exec sequelize db:migrate
pnpm exec sequelize db:seed:all