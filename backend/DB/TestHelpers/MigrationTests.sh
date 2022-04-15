#!/bin/sh

# This test verifies that all our migrations and seeds work together properly and can
# create a functioning DB when executed in the correct order.

# Fail if any command fails
set -e

sh ./backend/DB/TestHelpers/StartTestDB.sh

export NODE_ENV=db-tests

# Test that migrations and seeds don't throw errors and are self encapsulated / repeatable
echo "Migrating"
pnpm exec sequelize db:migrate
echo "Seeding"
pnpm exec sequelize db:seed:all
echo "Undoing seeds"
pnpm exec sequelize db:seed:undo:all
echo "Seeding again"
pnpm exec sequelize db:seed:all
echo "Undoing seeds again"
pnpm exec sequelize db:seed:undo:all
echo "Undoing migrations"
pnpm exec sequelize db:migrate:undo:all

# Round 2 for good measure
echo "Migrating"
pnpm exec sequelize db:migrate
echo "Seeding"
pnpm exec sequelize db:seed:all
echo "Undoing seeds"
pnpm exec sequelize db:seed:undo:all
echo "Seeding again"
pnpm exec sequelize db:seed:all
echo "Undoing seeds again"
pnpm exec sequelize db:seed:undo:all

echo "All migrations and seeds seem to work"