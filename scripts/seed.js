/**
 * Fills the database.
 */

const config = require('../config');

const PromisePool = require('es6-promise-pool');
const format = require('pg-format');
const { Pool } = require('pg');
const pool = new Pool({ ...config.db, max: config.concurrency });

const DAY_IN_MSEC = 86400000;

function* generatePromises({
  namePrefix = 'S',
  sensorAmount = 5,
  from = Date.now() - 7 * DAY_IN_MSEC,
  to = Date.now(),
  interval = 1,
  maxInsertions = 10000 } = {}
  ) {
  for (let i = 1; i <= sensorAmount; i++) {
    let time = from;
    let rowsAmount = 0;
    let rows = [];
    while (time < to) {
      const value = Math.floor((Math.random() * 20) + 10);
      rows.push([`${namePrefix}${i}`, new Date(time), value ]);
      rowsAmount++;
      time += interval * 1000;

      if (rowsAmount >= maxInsertions || time >= to) {
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

console.log('Please wait. It may take a long time...');
console.time('seed');

const now = Date.now();

let promiseIterator = generatePromises({
  sensorAmount: 10,
  from: now - 7 * DAY_IN_MSEC,
  interval: 1,
});
let promisePool = new PromisePool(promiseIterator, config.concurrency);
promisePool.start()
  .then(() => {
    // Broken sensor
    promiseIterator = generatePromises({
      namePrefix: 'BS',
      sensorAmount: 1,
      from: now - 7 * DAY_IN_MSEC,
      to: now - 3 * DAY_IN_MSEC,
      interval: 1,
    });
    promisePool = new PromisePool(promiseIterator, config.concurrency);
    return promisePool.start();
  })
  .then(() => pool.end())
  .then(() => console.log('The database has been filled!'))
  .then(() => console.timeEnd('seed'))
  .catch((error) => {
    console.error(error);
    process.exit(-1);
  });
