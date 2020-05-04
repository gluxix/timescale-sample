const config = require('./config');
const http = require('http');
const { Pool } = require('pg');
const pool = new Pool(config.db);

const queries = {
  sevenDays: "\
    SELECT time_bucket('1 minute', datetime) AS time, sensor_id, MAX(value), MIN(value), AVG(value) \
    FROM temperatures \
    WHERE datetime > NOW() - INTERVAL '7 days' \
    GROUP BY time, sensor_id \
    ORDER BY time DESC, sensor_id \
  ",
  firstSensorSevenDays: "\
    SELECT * \
    FROM temperatures \
    WHERE sensor_id = 'S1' AND datetime > NOW() - INTERVAL '7 days' \
    ORDER BY datetime DESC \
  ",
  lastValues: "\
    SELECT sensor_id, last(value, datetime) as last_value \
    FROM temperatures \
    GROUP BY sensor_id \
  ",
};

const measurementQueries = {
  sevenDays: `EXPLAIN ANALYZE ${queries.sevenDays}`,
  firstSensorSevenDays: `EXPLAIN ANALYZE ${queries.firstSensorSevenDays}`,
  lastValues: `EXPLAIN ANALYZE ${queries.lastValues}`,
};

const server = http.createServer((req, res) => {
  let q;
  switch (req.url) {
    case '/sevenDays': q = queries.sevenDays; break;
    case '/firstSensorSevenDays': q = queries.firstSensorSevenDays; break;
    case '/lastValues': q = queries.lastValues; break;
    case '/m/sevenDays': q = measurementQueries.sevenDays; break;
    case '/m/firstSensorSevenDays': q = measurementQueries.firstSensorSevenDays; break;
    case '/m/lastValues': q = measurementQueries.lastValues; break;
    default:
      res.end('HTTP/1.1 404 Not Found\r\n\r\n');
      return;
  }

  pool.connect()
    .then((client) => {
      return client.query(q)
        .then(({ rows }) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(rows));
          client.release();
        });
    })
    .catch(error => res.end(error.message))
});

server.listen(config.server.port, config.server.host, () => console.log(`HTTP listening on port ${config.server.port}`));
