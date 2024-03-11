CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  limite INTEGER NOT NULL,
  saldo INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_clientes_limites ON clientes (limite);

CREATE TABLE transacoes (
  id SERIAL PRIMARY KEY,
  id_cliente INTEGER REFERENCES clientes (id),
  tipo VARCHAR(1) NOT NULL,
  valor INTEGER NOT NULL,
  descricao VARCHAR(10),
  realizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_transacoes_id_cliente ON transacoes (
	id_cliente ASC,
	realizada_em DESC,
	tipo,
	descricao,
	valor,
	realizada_em
);

CREATE OR REPLACE FUNCTION f_inserir_debito(
	c_id INTEGER,
	t_valor INTEGER,
	t_descricao VARCHAR(10)
) RETURNS RECORD
AS $$
DECLARE
	encontrado clientes%rowtype;
	ret RECORD;
BEGIN
	SELECT * INTO encontrado FROM clientes WHERE id = c_id;
	IF NOT FOUND THEN
		SELECT -1 INTO ret;
		RETURN ret;
	END IF;

	UPDATE clientes
	SET saldo = saldo - t_valor
	WHERE
		id = c_id AND
		saldo - t_valor + limite >= 0
	RETURNING saldo, limite
	INTO ret;
	IF ret.saldo is NULL THEN
		SELECT -2 INTO ret;
    	RETURN ret;
  	END IF;
	
	INSERT INTO transacoes
		(id_cliente, tipo, valor, descricao)
	VALUES
		(c_id, 'd', t_valor, t_descricao);
	RETURN ret;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_inserir_credito(
	IN c_id INTEGER,
	IN t_valor INTEGER,
	IN t_descricao VARCHAR(10)
)  RETURNS RECORD
AS $$
DECLARE
	encontrado clientes%rowtype;
	ret RECORD;
BEGIN
	SELECT * INTO encontrado FROM clientes WHERE id = c_id;
	IF NOT FOUND THEN
		SELECT -1 INTO ret;
		RETURN ret;
	END IF;

	UPDATE clientes
	SET saldo = saldo + t_valor
	WHERE
		id = c_id
	RETURNING saldo, limite
	INTO ret;
	
	INSERT INTO transacoes
		(id_cliente, tipo, valor, descricao)
	VALUES
		(c_id, 'c', t_valor, t_descricao);
	RETURN ret;
END; $$ LANGUAGE plpgsql;

DO $$
BEGIN
  INSERT INTO clientes (nome, limite)
  VALUES
    ('o barato sai caro', 1000 * 100),
    ('zan corp ltda', 800 * 100),
    ('les cruders', 10000 * 100),
    ('padaria joia de cocaia', 100000 * 100),
    ('kid mais', 5000 * 100);
END; $$; 
