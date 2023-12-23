import User from '../models/schemas/User.js';
import { verifyToken } from '../utils/jwt.js';
import CustomError from './errorHandler.js';

export async function isAuth(req, res, next) {
  // 헤더에서 cookie를 가져온다.
  try {
    const token = req.cookies?.token;

    if (!token) {
      throw new CustomError('Authentication Error', '토큰이 없습니다.', {
        statusCode: 401,
      });
    }

    const decoded = verifyToken(token);

    const user = await User.findOne({ email: decoded.email }, { password: false }).lean();
    if (!user) {
      throw new CustomError('Authentication Error', '유저를 찾을 수 없습니다.', { statusCode: 401 });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    next(err);
  }
}
