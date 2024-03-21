import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import CustomError from '../middleware/errorHandler.js';

export function createToken(email, nickname, expiresSec = config.jwt.expiresSec) {
  return jwt.sign({ email, nickname }, config.jwt.secretKey, {
    expiresIn: expiresSec,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwt.secretKey, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError')
        throw new CustomError('Authentication Error', '토큰 기한이 만료 되었습니다.', {
          statusCode: 401,
          cause: err,
        });
      else if (err.name === 'JsonWebTokenError')
        throw new CustomError('Authentication Error', '유효한 토큰이 아닙니다.', { statusCode: 401, cause: err });
      else throw new CustomError('Authentication Error', '유효한 토큰이 아닙니다.', { statusCode: 401, cause: err });
    }

    return decoded;
  });
}
