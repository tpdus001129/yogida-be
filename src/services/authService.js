import nodemailer from 'nodemailer';
import User from '../models/schemas/user.js';
import Auth from '../models/schemas/auth.js';
import { createToken } from '../utils/jwt.js';
import config from '../config/config.js';
import bcrypt from 'bcrypt';
import { HttpException } from '../middleware/errorHandler.js';

const MAX_EXPIRY_MINUTE = 1000 * 60 * 5;

// 소셜 로그인 회원 가입 하기
export async function snsSignup(snsId, email, password, nickname) {
  // 이미 가입된 이메일 있는지 검사
  const hasEmail = await User.findOne({ email });

  if (hasEmail) {
    throw new Error('이미 등록되어 있는 이메일입니다.');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, parseInt(config.bcrypt.saltRounds));

    const result = await User.create({
      snsId,
      email,
      password: hashedPassword,
      nickname,
    });

    const token = createToken(result.email, result.nickname);
    return token;
  } catch (err) {
    throw new Error(err);
  }
}

// 회원 가입 하기
export async function signup(email, password, nickname) {
  // 이미 가입된 이메일 있는지 검사
  const hasEmail = await User.findOne({ email });

  if (hasEmail) {
    throw new Error('이미 등록되어 있는 이메일입니다.');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, parseInt(config.bcrypt.saltRounds));

    const result = await User.create({
      email,
      password: hashedPassword,
      nickname,
    });

    const token = createToken(result.email, result.nickname);
    return token;
  } catch (err) {
    throw new Error(err);
  }
}

// 로그인 하기
export async function login(email, password) {
  const user = await User.findOne({ email }).exec();

  if (!user) {
    throw new Error('이메일과 비밀번호를 확인해 주세요.');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error('이메일과 비밀번호를 확인해 주세요.');
  }

  const token = createToken(user.email, user.nickname);

  return token;
}

// 비밀번호 변경 하기
export async function changePassword(email, password) {
  // 이메일이 존재 하는지 확인
  const user = await User.findOne({ email });

  if (!user) {
    throw new HttpException(400, '해당 유저가 존재하지 않습니다.');
  }

  const hashedPassword = await bcrypt.hash(password, parseInt(config.bcrypt.saltRounds));
  return await User.findOneAndUpdate({ email }, { password: hashedPassword });
}

// 인증 번호 이메일 전송하기
export async function sendEmail(email) {
  if (email === '') {
    throw new HttpException(400, `이메일을 입력해주세요.`);
  }
  let isOver = false;

  //이미 가입된 이메일이 있는지 확인
  const isEmailSaved = await User.findOne({ email });

  //이미 DB에 이메일이 있다면
  if (isEmailSaved) {
    throw new HttpException(400, '이미 등록되어 있는 이메일입니다.');
  }

  //이미 인증db에 정보가 있는지 확인
  const authInfo = await Auth.findOne({ email }).lean();
  if (authInfo) {
    if (new Date() < authInfo.expiredTime) {
      isOver = false;
      throw new HttpException(400, `이미 인증번호가 발송되었습니다. ${MAX_EXPIRY_MINUTE}분 뒤에 다시 요청해주세요.`);
    } else {
      isOver = true;
    }
  }

  const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.GOOGLE_APP_KEY,
    },
  });

  const authCode = Math.random().toString(36).slice(2);
  const message = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: '요기다 인증번호',
    text: authCode,
  };

  // 인증코드 유효기간 설정
  let expiredTime = new Date();
  expiredTime.setMinutes(expiredTime.getMinutes() + MAX_EXPIRY_MINUTE);

  transport.sendMail(message, async (err) => {
    if (err) {
      return new Error(err.message);
    } else {
      if (isOver) {
        await Auth.findOneAndUpdate(
          { email },
          {
            authCode,
            expiredTime,
          },
        );
      } else {
        await Auth.create({
          email,
          authCode,
          expiredTime,
        });
      }
    }
  });
}

//  인증메일 체크하기
export async function checkEmailCode({ email, authCode }) {
  const savedAuthInfo = await Auth.findOne({ email });

  if (!savedAuthInfo) {
    throw new HttpException(400, `인증메일 받기를 먼저 요청해주세요.`);
  }

  const isValidTime = new Date() < savedAuthInfo.expiredTime;
  if (!isValidTime) {
    throw new HttpException(400, '인증시간이 초과되었습니다. 다시 인증메일을 받아주세요.');
  }
  if (savedAuthInfo.authCode !== authCode) {
    throw new HttpException(400, '인증번호가 일치하지 않습니다.');
  }
}
