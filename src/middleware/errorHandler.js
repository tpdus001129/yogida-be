export default class CustomError extends Error {
  constructor(name, description, options) {
    if (options?.cause !== undefined && options?.cause !== null) {
      super(description, { cause: options.cause });
    } else {
      super(description);
    }
    this.name = name;
    this.statusCode = options?.statusCode ?? 500;
  }
}

export function errorHandler(err, req, res) {
  return res.status(err.statusCode ?? 500).json({
    result: 'fail',
    error: err.message ?? 'Error',
  });
}
