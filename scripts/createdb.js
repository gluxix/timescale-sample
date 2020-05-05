/**
 * Creates the database.
 */

const config = require('../config');

const { Client } = require('pg');
const client = new Client(config.db);

const CREATE_TABLE_QUERY = '\
  CREATE TABLE IF NOT EXISTS temperatures (\
    sensor_id   VARCHAR(5)        NOT NULL,\
    datetime    TIMESTAMPTZ       NOT NULL,\
    value       DOUBLE PRECISION  NULL\
  )\
';

client.connect()
  .then(() => client.query(CREATE_TABLE_QUERY))
  .then(() => client.query("SELECT create_hypertable('temperatures', 'datetime')"))
  .catch((error) => {
    if (error.message !== 'table "temperatures" is already a hypertable') {
      throw error;
    }
  })
  .then(() => client.end())
  .then(() => console.log('The database has been created!'))
  .catch((error) => {
    console.error(error);
    process.exit(-1);
  });
