import { HTTP_STATUS_CODES, HTTP_VERBS, URL_PATTERNS } from './util/constants';
import { createTransactionHandler, getBankStatementHandler } from './handlers';

import { AddressInfo } from 'node:net';
import http from 'node:http';
import { pgPool } from './util/pg';

const API_PORT = Number(process.env.API_PORT);

const server = http
  .createServer((req, res) => {
    let match: RegExpMatchArray | null | undefined;

    if (req.method === HTTP_VERBS.POST && (match = req.url?.match(URL_PATTERNS.CREATE_TRANSACTION))) {
      createTransactionHandler(req, res, Number(match[1]));
      return;
    }

    if (HTTP_VERBS.GET === req.method && (match = req.url?.match(URL_PATTERNS.GET_BANK_STATEMENT))) {
      getBankStatementHandler(req, res, Number(match[1]));
      return;
    }

    if (HTTP_VERBS.GET === req.method && req.url === URL_PATTERNS.GET_PING) {
      res.writeHead(HTTP_STATUS_CODES.OK).end('PONG');
      return;
    }

    res.writeHead(HTTP_STATUS_CODES.NOT_FOUND).end();
    return;
  })
  .listen(API_PORT)
  .once('listening', () => {
    const { port, address } = server.address() as AddressInfo;
    console.info(`Server listening on http://${address}:${port}`);
  });

function shutdown() {
  console.log('Shutting down gracefully...');

  server.close(() => {
    console.log('Server closed.');

    pgPool.end();

    process.exit(0);
  });

  // Force close the server after 5 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
