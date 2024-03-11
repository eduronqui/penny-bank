import { HTTP_STATUS_CODES, SQL_QUERIES } from '../util/constants';

import http from 'node:http';
import { pgPool } from '../util/pg';

export async function getBankStatementHandler(
  _req: http.IncomingMessage,
  res: http.ServerResponse,
  customerId: number
) {
  if (Number.isNaN(customerId) || !Number.isInteger(customerId) || customerId <= 0) {
    res.writeHead(HTTP_STATUS_CODES.NOT_FOUND).end();
    return;
  }

  const client = await pgPool.connect();
  try {
    const [saldoResult, ultimasTransacoesResult] = await Promise.all([
      client.query<InfoSaldo>(SQL_QUERIES.SELECT_BALANCE, [customerId]),
      client.query<Transacao[]>(SQL_QUERIES.SELECT_LAST_TRANSACTIONS, [customerId]),
    ]);

    const saldo = saldoResult.rows[0];

    if (!saldo) {
      // Customer not found
      res.writeHead(HTTP_STATUS_CODES.NOT_FOUND).end();
      return;
    }

    res.writeHead(HTTP_STATUS_CODES.OK).end(
      JSON.stringify({
        saldo,
        ultimas_transacoes: ultimasTransacoesResult.rows,
      })
    );
  } catch (err) {
    console.error(err);
    res.writeHead(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).end();
  } finally {
    client.release();
  }
}
