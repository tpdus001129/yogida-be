import commonError from '../constants/errorConstant.js';

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

// eslint-disable-next-line
export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.cause) {
    // cause 가 있을때만 출력
    console.error(err.cause);
  }

  return res.status(err.statusCode ?? 500).json({
    name: err.name ?? commonError.UNKNOWN_ERROR,
    message: err.message ?? '알 수 없는 에러 입니다.',
  });
}
