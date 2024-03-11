export const HTTP_VERBS = {
  GET: 'GET',
  POST: 'POST',
} as const;

export const HTTP_STATUS_CODES = {
  OK: 200,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const URL_PATTERNS = {
  CREATE_TRANSACTION: new RegExp(/\/clientes\/(\d*)\/transacoes/i),
  GET_BANK_STATEMENT: new RegExp(/\/clientes\/(\d*)\/extrato/i),
  GET_PING: '/ping',
} as const;

export const SQL_QUERIES = {
  INSERT_DEBIT: 'SELECT f_inserir_debito ($1, $2, $3);',
  INSERT_CREDIT: 'SELECT f_inserir_credito ($1, $2, $3);',
  SELECT_LAST_TRANSACTIONS:
    'SELECT t.tipo, t.valor, t.descricao, t.realizada_em FROM transacoes t WHERE t.id_cliente = $1 ORDER BY t.realizada_em DESC LIMIT 10;',
  SELECT_BALANCE: 'SELECT saldo AS total, limite, NOW() AS data_extrato FROM clientes WHERE id = $1;',
} as const;
