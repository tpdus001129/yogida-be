import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export function createToken(email, nickname) {
  return jwt.sign({ email, nickname }, config.jwt.secretKey, {
    expiresIn: config.jwt.expiresSec,
  });
}
