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

## Notes

Populating of `5 sensors * every 10 secs * month` may take a very long time. It was tested on:

- CPU: i7-8665U CPU @ 1.90GHz × 8

and it took `22.5 mins`.

> UDP after multiple insertion (100 rows per INSERT INTO): `35 seconds` instead of `22.5 mins`. **x40 faster**
> UDP 2: `50 sensors * every 1 sec * 6 months (777,600,000 rows!)` takes `70.5 mins`.

## Problems

> The database has a default configuration.

---

- Database logs during seeding process (50 * 6 months * every sec):
```
timescaledb_1  | 2020-05-04 15:50:05.459 UTC [70] HINT:  Consider increasing the configuration parameter "max_wal_size".
timescaledb_1  | 2020-05-04 15:50:08.794 UTC [70] LOG:  checkpoints are occurring too frequently (3 seconds apart)
```

---

- Any query produces this LOG (with 777,600,000 rows):
```
timescaledb_1  | 2020-05-04 16:16:08.334 UTC [1] LOG:  background worker "parallel worker" (PID 1048) was terminated by signal 9: Killed
timescaledb_1  | 2020-05-04 16:16:08.334 UTC [1] DETAIL:  Failed process was running:     SELECT sensor_id, last(value, datetime) as last_value     FROM temperatures     GROUP BY sensor_id   
timescaledb_1  | 2020-05-04 16:16:08.336 UTC [1] LOG:  terminating any other active server processes
timescaledb_1  | 2020-05-04 16:16:08.336 UTC [1046] WARNING:  terminating connection because of crash of another server process
timescaledb_1  | 2020-05-04 16:16:08.336 UTC [1046] DETAIL:  The postmaster has commanded this server process to roll back the current transaction and exit, because another server process exited abnormally and possibly corrupted shared memory.
timescaledb_1  | 2020-05-04 16:16:08.336 UTC [1046] HINT:  In a moment you should be able to reconnect to the database and repeat your command.
timescaledb_1  | 2020-05-04 16:16:08.339 UTC [1041] WARNING:  terminating connection because of crash of another server process
timescaledb_1  | 2020-05-04 16:16:08.339 UTC [1041] DETAIL:  The postmaster has commanded this server process to roll back the current transaction and exit, because another server process exited abnormally and possibly corrupted shared memory.
timescaledb_1  | 2020-05-04 16:16:08.339 UTC [1041] HINT:  In a moment you should be able to reconnect to the database and repeat your command.
timescaledb_1  | 2020-05-04 16:16:08.559 UTC [1] LOG:  all server processes terminated; reinitializing
timescaledb_1  | 2020-05-04 16:16:08.651 UTC [1052] LOG:  database system was interrupted; last known up at 2020-05-04 16:09:52 UTC
timescaledb_1  | 2020-05-04 16:16:08.926 UTC [1052] LOG:  database system was not properly shut down; automatic recovery in progress
timescaledb_1  | 2020-05-04 16:16:08.931 UTC [1052] LOG:  redo starts at 76/82EAFA58
timescaledb_1  | 2020-05-04 16:16:08.931 UTC [1052] LOG:  invalid record length at 76/82EAFA90: wanted 24, got 0
timescaledb_1  | 2020-05-04 16:16:08.931 UTC [1052] LOG:  redo done at 76/82EAFA58
timescaledb_1  | 2020-05-04 16:16:08.972 UTC [1] LOG:  database system is ready to accept connections
timescaledb_1  | 2020-05-04 16:16:08.978 UTC [1058] LOG:  TimescaleDB background worker launcher connected to shared catalogs
```