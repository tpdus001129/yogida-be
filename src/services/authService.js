import User from '../models/schemas/user.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import bcrypt from 'bcrypt';

export async function signup(email, password, nickname) {
  try {
    const hashedPassword = await bcrypt.hash(password, parseInt(config.bcrypt.saltRounds));

    const result = await User.create({
      email,
      password: hashedPassword,
      nickname,
    });

    const token = jwt.createToken(result.email, result.nickname);
    return token;
  } catch (err) {
    throw new Error(err);
  }
}

export async function login(email, password) {
  const user = await User.findOne({ email }).exec();

  if (user.useyn) {
    throw new Error('없거나 탈퇴된 계정입니다.');
  }

  if (!user) {
    throw new Error('이메일과 비밀번호를 확인해 주세요.');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error('이메일과 비밀번호를 확인해 주세요.');
  }

  const token = jwt.createToken(user.email, user.nickname);
  return token;
}
