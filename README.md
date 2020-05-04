# TimescaleDB example

## Run

`docker-compose up`

Each run will populate a database with different values.

> If you want to change a code don't forget rebuild an image. Or just type: `docker-compose --force-recreate --build`.

### Run TimescaleDB only in Docker

Also you can run only TimescaleDB `docker-compose up timescaledb`.

#### And then run Node.js manually from a console

```bash
# Assume that you have already installed Node.js
node -v # Should print something like that: v12.16.3

# Install dependencies
npm install
# Create database (table)
DB_HOST=localhost npm run createdb
# Fill database
DB_HOST=localhost npm run seed
# Start server
DB_HOST=localhost npm run start
```

## Stop

`docker-compose down`

## Code structure explanation:

The project includes 3 parts:
1. Docker files: `Dockerfile`, `docker-compose.yml`, `.dockerignore`
2. Script files: `scripts/createdb.js`, `scripts/seed.js`
3. The main script: `index.js`

- `Dockerfile` allows you to run the node.js application as a docker container.
- `docker-compose.yml` includes the dockerized node.js application and TimescaleDB (PostgreSQL).
- `scripts/createdb.js` helps to create a table (a database preparing).
- `scripts/seed.js` helps to populate the table with random values.
- `index.js` contains a super simple HTTP server which helps you to make queries.

## API

- `http://localhost:8080/sevenDays`
- `http://localhost:8080/firstSensorSevenDays`
- `http://localhost:8080/lastValues`
