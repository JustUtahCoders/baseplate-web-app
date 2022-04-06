#!/bin/sh

# This test verifies that all our migrations and seeds work together properly and can
# create a functioning DB when executed in the correct order.

# Fail if any command fails
set -e

sh ./backend/DB/TestHelpers/StartTestDB.sh

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