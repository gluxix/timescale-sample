/**
 * Fills the database.
 */

const config = require('../config');

const PromisePool = require('es6-promise-pool');
const format = require('pg-format');
const { Pool } = require('pg');
const pool = new Pool({ ...config.db, max: config.concurrency });

const DAY_IN_MSEC = 86400000;

function* generatePromises({ sensorAmount = 50, daysAgo = 6 * 30, interval = 1, maxInsertions = 100 } = {}) {
  const now = Date.now();

  for (let i = 1; i <= sensorAmount; i++) {
    let time = now - daysAgo * DAY_IN_MSEC;
    let rowsAmount = 0;
    let rows = [];
    while (time < now) {
      const value = Math.floor((Math.random() * 20) + 10);
      rows.push([`S${i}`, new Date(time), value ]);
      rowsAmount++;
      time += interval * 1000;

      if (rowsAmount >= maxInsertions || time >= now) {
        const q = format('INSERT INTO temperatures(sensor_id, datetime, value) VALUES %L', rows);
        yield pool.connect()
          .then((client) => {
            return client.query(q)
              .then(() => client.release());
          });
        rows = [];
        rowsAmount = 0;
      }
    }
  }
}

/**
 * Returns true if the database is empty.
 * @returns {Promise<boolean>}
 */
function shouldFillDatabase() {
  return pool.connect()
    .then((client) => {
      return client.query('SELECT count(*) FROM temperatures')
        .then(({ rows }) => Number(rows[0].count) === 0)
        .then((shouldFill) => {
          client.release();
          console.log('shouldFillDatabase:', shouldFill);
          return shouldFill;
        });
    });
}

console.log('Please wait. It may take a long time...');
console.time('seed');

shouldFillDatabase()
  .then((shouldFill) => {
    if (shouldFill) {
      const promisePool = new PromisePool(generatePromises(), config.concurrency);
      return promisePool.start();
    }
  })
  .then(() => pool.end())
  .then(() => console.log('The database has been filled!'))
  .then(() => console.timeEnd('seed'))
  .catch((error) => {
    console.error(error);
    process.exit(-1);
  });
