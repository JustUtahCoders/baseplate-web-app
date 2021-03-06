# Baseplate web app

## Running locally

First, install [pnpm](https://pnpm.io/) and [Docker](https://www.docker.com/)

```sh
# Create .env files
cp .env.example .env.dev

# Now fill in values of .env.dev

# Now pnpm install
pnpm install
pnpm run develop

# new terminal tab
pnpm exec sequelize db:migrate
pnpm exec sequelize db:seed:all

open http://localhost:7600
```

## Visual Studio Code debugging

To debug the NodeJS server in Visual Studio Code, first start up the database and frontend:

```sh
pnpm run dev:vscode
```

Then click on "Run and Debug" in VS Code, and press Start for Develop Backend.

## Connecting to local database

```sh
docker-compose exec db bash
psql baseplate
# show tables
\dt
select * from "Users";
```

## Database migrations

Database migrations are done via sequelize cli. You must run them manually whenever there's a new migration. Make sure you are running `pnpm run develop` or `pnpm run develop:db` before attempting to run migrations.

```sh
# Run migrations
pnpm exec sequelize db:migrate

# Undo last migration
pnpm exec sequelize db:migrate:undo

# Undo all migrations
pnpm exec sequelize db:migrate:undo:all

# Create migration
pnpm exec sequelize migration:create --name INSERTNAMEHERE
```

## Seed data

Seed data (sample user, etc) is created via sequelize cli. You must run them manually. Make sure you are running `pnpm run develop` or `pnpm run develop:db` before attempting to seed.

```sh
# Run seeds
pnpm exec sequelize db:seed:all

# Undo last migration
pnpm exec sequelize db:seed:undo

# Undo all seeds
pnpm exec sequelize db:seed:undo:all

# Create migration
pnpm exec sequelize seed:create --name INSERTNAMEHERE
```

## Nuking your database

If you want to just nuke your database and start fresh, run the following commands:

```sh
docker-compose down -v
docker-compose up -d
sleep 1
pnpm exec sequelize db:migrate
pnpm exec sequelize db:seed:all
```
