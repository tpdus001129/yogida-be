import { verifyToken } from '../utils/jwt.js';

export async function isAuth(req, res, next) {
  // 헤더에서 cookie를 가져온다.
  console.log('미들웨어');
  const token = req.cookies?.token;

  if (!token) {
    throw new Error('토큰이 없는디요?');
  }

  try {
    const user = await verifyToken(token);

    req.locals.user = user;
    req.locals.userId = user._id.toString();
    next();
  } catch (err) {
    if (err.message.includes('expired')) next('토큰 기한이 만료 되었습니다.');
    else if (err.message.includes('invalid')) next('유효한 토큰이 아닙니다.');
    else next(err);
  }
}
