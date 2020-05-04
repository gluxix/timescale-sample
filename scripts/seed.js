/**
 * Fills the database.
 */

const config = require('../config');

const { Pool } = require('pg');
const pool = new Pool(config.db);

const DAY_IN_MSEC = 86400000;

function generateSeeds({ sensorAmount = 2, daysAgo = 7, interval = 90 } = {}) {
  const now = Date.now();

  return Array(sensorAmount).fill(0).map((_, i) => `S${i + 1}`).reduce((acc, id) => {
    let time = now - daysAgo * DAY_IN_MSEC;
    while (time < now) {
      const value = Math.floor((Math.random() * 20) + 10);
      acc.push({ sensor_id: id, datetime: new Date(time), value });
      time += interval * 1000;
    }
    return acc;
  }, []);
}

function insertSeed({ sensor_id, datetime, value }) {
  return pool.connect()
    .then((client) => {
      return client
        .query('INSERT INTO temperatures(sensor_id, datetime, value) VALUES($1, $2, $3)', [
          sensor_id,
          datetime,
          value,
        ])
        .then(() => client.release());
    });
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

shouldFillDatabase()
  .then((shouldFill) => {
    if (shouldFill) {
      return Promise.all(generateSeeds().map(insertSeed));
    }
  })
  .then(() => pool.end())
  .then(() => console.log('The database has been filled!'))
  .catch((error) => {
    console.error(error);
    process.exit(-1);
  });
