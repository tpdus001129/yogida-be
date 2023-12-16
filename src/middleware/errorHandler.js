export class HttpException extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

function errorHandler(err, req, res) {
  return res.status(err.status || 500).json({
    result: 'fail',
    error: err.message || 'Error',
  });
}

export default errorHandler;
