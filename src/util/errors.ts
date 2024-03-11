export class BancoDeDadosError extends Error {
  constructor(err: Error) {
    super(`Database error: ${err.message}`);
  }
}
