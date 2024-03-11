import { Pool } from 'pg';
import assert from 'node:assert';

assert(process.env.DATABASE_URL, 'DATABASE_URL is required');

const dbUrl = new URL(process.env.DATABASE_URL);

export const pgPool = new Pool({
  database: dbUrl.pathname.slice(1),
  user: dbUrl.username,
  password: dbUrl.password,
  host: dbUrl.hostname,
  port: Number(dbUrl.port),
  max: 20,
});

if (process.env.NODE_ENV !== 'production') {
  let connections: number = 0;

  pgPool.on('connect', () => {
    connections++;
    console.info(`Connected to database. Active connections: ${connections}`);
  });

  pgPool.on('acquire', () => {
    console.info('Connection acquired from the pool');
  });

  pgPool.on('error', (err) => {
    console.error('Error on database connection', err);
  });

  pgPool.on('remove', () => {
    connections--;
    console.info(`Connection removed from the pool. Active connections: ${connections}`);
  });
}
