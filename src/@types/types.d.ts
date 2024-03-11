type TipoCredito = 'c';

type TipoDebito = 'd';

type TipoTransacao = TipoCredito | TipoDebito;

interface NovaTransacao {
  valor: number;
  tipo: TipoTransacao;
  descricao: string;
}

interface Transacao extends NovaTransacao {
  realizada_em: Date;
}

interface InfoSaldo {
  total: number;
  limite: number;
  data_extrato: Date;
}
