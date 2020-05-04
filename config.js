module.exports = {
  db: {
    host: process.env.DB_HOST || 'timescaledb',
    port: process.env.DB_PORT || '5432',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
  },
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || '8080',
  },
};
