import nodemailer from 'nodemailer';
import User from '../models/schemas/User.js';
import Auth from '../models/schemas/Auth.js';
import { createToken } from '../utils/jwt.js';
import config from '../config/config.js';
import bcrypt from 'bcrypt';
import CustomError from '../middleware/errorHandler.js';
import commonError from '../constants/errorConstant.js';

const MAX_EXPIRY_MINUTE = 5;

// 소셜 로그인 회원 가입 하기
export async function snsSignup(snsId, email, nickname, profileImageUrl) {
  // 이미 가입된 이메일 있는지 검사
  const hasEmail = await User.findOne({ email });

  if (hasEmail) {
    throw new CustomError(commonError.AUTHENTICATION_ERROR, '이미 가입된 이메일 입니다.', {
      statusCode: 409, // conflict
    });
  }

  const result = await User.create({
    snsId,
    email,
    nickname,
    profileImageSrc: profileImageUrl,
    provider: 'kakao',
  }).catch((err) => {
    throw new CustomError(commonError.DB_ERROR, '유저를 생성 하는 도중 문제가 생겼습니다.', {
      statusCode: 500,
      cause: err,
    });
  });

  const token = createToken(result.email, result.nickname);
  return token;
}

// 회원 가입 하기
export async function signup(email, password, nickname) {
  // 이미 가입된 이메일 있는지 검사
  const hasEmail = await User.findOne({ email });

  if (hasEmail) {
    throw new CustomError(commonError.AUTHENTICATION_ERROR, '이미 등록되어 있는 이메일입니다.', { statusCode: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, parseInt(config.bcrypt.saltRounds)).catch((err) => {
    throw new CustomError(commonError.AUTHENTICATION_ERROR, '비밀번호를 암호화 하는데 문제가 생겼습니다.', {
      statusCode: 500,
      cause: err,
    });
  });

  const result = await User.create({
    email,
    password: hashedPassword,
    nickname,
    provider: 'email',
  }).catch((err) => {
    throw new CustomError(commonError.DB_ERROR, '유저를 생성 하는 도중 문제가 생겼습니다.', {
      statusCode: 500,
      cause: err,
    });
  });

  const token = createToken(result.email, result.nickname);
  return token;
}

// 로그인 하기
export async function login(email, password) {
  const user = await User.findOne({ email }).lean();

  if (!user) {
    throw new CustomError(commonError.AUTHENTICATION_ERROR, '이메일과 비밀번호를 확인해 주세요.', { statusCode: 400 });
  }

  if (user.provider === 'kakao') {
    throw new CustomError(
      commonError.AUTHENTICATION_ERROR,
      '카카오 계정으로 가입된 이메일 입니다. \n카카오 로그인을 이용하세요',
      { statusCode: 409 },
    );
  }
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new CustomError(commonError.AUTHENTICATION_ERROR, '이메일과 비밀번호를 확인해 주세요.', { statusCode: 400 });
  }

  const token = createToken(user.email, user.nickname);

  return token;
}

// 비밀번호 변경 하기
export async function changePassword(email, password) {
  // 이메일이 존재 하는지 확인
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError('Cannot find user', '해당 유저가 존재하지 않습니다.', { statusCode: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, parseInt(config.bcrypt.saltRounds));
  user.password = hashedPassword;
  await user.save();
  return user;
}

// 인증 번호 이메일 전송하기
export async function sendAuthenticationEmail(email, type) {
  if (email === '') {
    throw new CustomError(commonError.AUTHENTICATION_ERROR, `이메일을 입력해주세요.`, { statusCode: 400 });
  }
  let isOver = false;

  if (type === 'signup') {
    //이미 가입된 이메일이 있는지 확인
    const isEmailSaved = await User.findOne({ email });

    //이미 DB에 이메일이 있다면
    if (isEmailSaved) {
      throw new CustomError(commonError.AUTHENTICATION_ERROR, '이미 등록되어 있는 이메일입니다.', { statusCode: 409 });
    }
  }

  //이미 인증db에 정보가 있는지 확인
  const authInfo = await Auth.findOne({ email }).lean();

  if (authInfo) {
    // 인증db에 정보가  있다면
    // 현재 시간 보다 인증정보에 유효시간이 더 크다면 (아직 안지남))
    if (new Date().getTime() < authInfo.expiredTime.getTime()) {
      isOver = false;
      throw new CustomError(
        commonError.AUTHENTICATION_ERROR,
        `이미 인증번호가 발송되었습니다. ${MAX_EXPIRY_MINUTE}분 뒤에 다시 요청해주세요.`,
        { statusCode: 400 },
      );
    } else {
      isOver = true;
    }
  }

  // nodemailer 세팅한다.
  const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.GOOGLE_APP_KEY,
    },
  });
  // 렌덤 코드 생성
  const authCode = Math.random().toString(36).slice(2);
  // 메세지 포멧 설정
  const message = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: '요기다 인증번호',
    text: authCode,
  };

  // 인증코드 유효기간 설정
  let expiredTime = new Date();
  // expiredTime 을 현재 시간 + 5 를 더해서 설정한다.
  expiredTime.setMinutes(expiredTime.getMinutes() + MAX_EXPIRY_MINUTE);

  const sendMessage = () =>
    new Promise((resolve, reject) => {
      transport.sendMail(message, async (err) => {
        if (err) {
          reject(
            new CustomError(
              'Mail Transport Error',
              '메일 전송을 실패하였습니다. 메일 주소에 문제가 없는 지 확인해주시고 문제가 없다면 잠시 후에 다시 시도해 주세요',
              { status: 500, cause: err },
            ),
          );
        }
        console.log('onSuccess');
        resolve();
      });
    });

  await sendMessage();

  // 유효기한이 넘으면 아래가 실행됨.
  if (isOver) {
    await Auth.updateOne({ email }, { authCode, expiredTime }); // 유효시간을 업데이트
    return;
  }
  await Auth.create({ email, authCode, expiredTime });
}

//  인증메일 체크하기
export async function checkEmailCode({ email, authCode }) {
  const savedAuthInfo = await Auth.findOne({ email });

  if (!savedAuthInfo) {
    throw new CustomError(commonError.AUTHENTICATION_ERROR, `인증메일 받기를 먼저 요청해주세요.`, { statusCode: 400 });
  }

  const isValidTime = new Date().getMinutes() < savedAuthInfo.expiredTime;
  if (!isValidTime) {
    throw new CustomError(commonError.AUTHENTICATION_ERROR, '인증시간이 초과되었습니다. 다시 인증메일을 받아주세요.', {
      statusCode: 400,
    });
  }
  if (savedAuthInfo.authCode !== authCode) {
    throw new CustomError(commonError.AUTHENTICATION_ERROR, '인증번호가 일치하지 않습니다.', { statusCode: 400 });
  }
}

// 인증 메일 삭제하기
export async function deleteAuthCode(email) {
  return await Auth.deleteOne({ email }).catch((err) => {
    throw new CustomError(commonError.DB_ERROR, '삭제하던 도중 에러가 발생했습니다.', { statusCode: 500, cause: err });
  });
}
