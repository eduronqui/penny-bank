/// <reference path="../@types/types.d.ts" />

import { HTTP_STATUS_CODES, SQL_QUERIES } from '../util/constants';

import http from 'node:http';
import { once } from 'node:events';
import { pgPool } from '../util/pg';

export async function createTransactionHandler(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  customerId: number
) {
  if (Number.isNaN(customerId) || !Number.isInteger(customerId) || customerId <= 0) {
    res.writeHead(HTTP_STATUS_CODES.NOT_FOUND).end();
    return;
  }

  const parsedBody = JSON.parse(await once(req, 'data').then((data) => data.toString()));
  if (!parsedBody) {
    res.writeHead(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY).end();
    return;
  }

  const body: NovaTransacao = {
    valor: Number(parsedBody.valor),
    tipo: parsedBody.tipo,
    descricao: parsedBody.descricao,
  };

  if (Number.isNaN(body.valor) || !Number.isInteger(body.valor) || body.valor <= 0) {
    res.writeHead(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY).end();
    return;
  }

  if (!body.tipo || ['d', 'c'].indexOf(body.tipo) === -1) {
    res.writeHead(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY).end();
    return;
  }

  if (!body.descricao || body.descricao.length > 10) {
    res.writeHead(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY).end();
    return;
  }

  const client = await pgPool.connect();
  try {
    let result: string;
    switch (body.tipo) {
      case 'c':
        const insertCreditResult = await client.query<{ f_inserir_credito: string }>(SQL_QUERIES.INSERT_CREDIT, [
          customerId,
          body.valor,
          body.descricao,
        ]);
        result = insertCreditResult.rows[0].f_inserir_credito;
        break;
      case 'd':
        const insertDebitResult = await client.query<{ f_inserir_debito: string }>(SQL_QUERIES.INSERT_DEBIT, [
          customerId,
          body.valor,
          body.descricao,
        ]);
        result = insertDebitResult.rows[0].f_inserir_debito;
        break;
    }

    if (result === '(-1)') {
      res.writeHead(HTTP_STATUS_CODES.NOT_FOUND).end();
      return;
    }

    if (result === '(-2)') {
      res.writeHead(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY).end();
      return;
    }

    const [saldo, limite] = result
      .substring(1, result.length - 1)
      .split(',')
      .map(Number);

    res.writeHead(HTTP_STATUS_CODES.OK).end(JSON.stringify({ saldo, limite }));
    return;
  } catch (err: any) {
    console.error(err);
    res.writeHead(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).end();
    return;
  } finally {
    client.release();
  }
}
