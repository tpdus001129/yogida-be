import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/schemas/user.js';

export async function isAuth(req, res, next) {
  const header = req.get('Authorization');

  if (!header) {
    return res.status(401).json({ message: 'Authorization:오류, 로그인 토큰이 필요합니다.' });
  }

  if (!header.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Authorization:오류, 지원하지 않는 포맷입니다.' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secretKey);

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(401).json({ message: '해당 유저가 존재하지 않습니다.' });
    }
    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (err) {
    if (err.message.includes('expired')) next('토큰 기한이 만료 되었습니다.');
    else if (err.message.includes('invalid')) next('유효한 토큰이 아닙니다.');
    else next(err);
  }
}
