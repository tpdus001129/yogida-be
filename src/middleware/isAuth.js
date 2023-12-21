import User from '../models/schemas/User.js';
import { verifyToken } from '../utils/jwt.js';
import CustomError from './errorHandler.js';

export async function isAuth(req, res, next) {
  // 헤더에서 cookie를 가져온다.
  const token = req.cookies?.token;

  if (!token) {
    throw new CustomError('Authentication Error', '유효한 토큰이 아닙니다.', { statusCode: 401 });
  }

  try {
    const decoded = verifyToken(token);

    const user = await User.findOne({ email: decoded.email }, { password: false }).lean();
    if (!user) {
      throw new CustomError('Authentication Error', '유효한 토큰이 아닙니다.', { statusCode: 401 });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    next(err);
  }
}
