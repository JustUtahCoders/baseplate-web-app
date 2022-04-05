# single-spa foundry web app

## Running locally

First, install [pnpm](https://pnpm.io/) and [Docker](https://www.docker.com/)

```sh
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
psql foundry
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
