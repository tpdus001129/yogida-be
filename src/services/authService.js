import nodemailer from 'nodemailer';
<<<<<<< HEAD
import User from '../models/schemas/user.js';
import Auth from '../models/schemas/Auth.js';
=======
import User from '../models/schemas/User.js';
import Auth from '../models/schemas/auth.js';
>>>>>>> 1d50de02591c2a707513ce41e355759ddc08d08d
import { createToken } from '../utils/jwt.js';
import config from '../config/config.js';
import bcrypt from 'bcrypt';
import CustomError from '../middleware/errorHandler.js';

const MAX_EXPIRY_MINUTE = 5;

// 소셜 로그인 회원 가입 하기
export async function snsSignup(snsId, email, nickname) {
  // 이미 가입된 이메일 있는지 검사
  const hasEmail = await User.findOne({ email });

  if (hasEmail) {
    throw new Error('이미 등록되어 있는 이메일입니다.');
  }

  try {
    const result = await User.create({
      snsId,
      email,
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
    throw new CustomError('[signup error]', '이미 등록되어 있는 이메일입니다.', { statusCode: 409 });
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
    throw new CustomError('login error', '이메일과 비밀번호를 확인해 주세요.', { statusCode: 400 });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new CustomError('login error', '이메일과 비밀번호를 확인해 주세요.', { statusCode: 400 });
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
export async function sendAuthenticationEmail(email) {
  if (email === '') {
    throw new CustomError('Authentication Error', `이메일을 입력해주세요.`, { statusCode: 400 });
  }
  let isOver = false;

  //이미 가입된 이메일이 있는지 확인
  const isEmailSaved = await User.findOne({ email });

  //이미 DB에 이메일이 있다면
  if (isEmailSaved) {
    throw new CustomError('Authentication Error', '이미 등록되어 있는 이메일입니다.', { statusCode: 400 });
  }

  //이미 인증db에 정보가 있는지 확인
  const authInfo = await Auth.findOne({ email }).lean();

  if (authInfo) {
    // 인증db에 정보가  있다면
    // 현재 시간 보다 인증정보에 유효시간이 더 크다면 (아직 안지남))
    if (new Date().getTime() < authInfo.expiredTime.getTime()) {
      isOver = false;
      throw new CustomError(
        'Authentication Error',
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

  console.log('[isOver]', isOver);
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
    throw new CustomError('Authentication Error', `인증메일 받기를 먼저 요청해주세요.`, { statusCode: 400 });
  }

  const isValidTime = new Date().getMinutes() < savedAuthInfo.expiredTime;
  if (!isValidTime) {
    throw new CustomError('Authentication Error', '인증시간이 초과되었습니다. 다시 인증메일을 받아주세요.', {
      statusCode: 400,
    });
  }
  if (savedAuthInfo.authCode !== authCode) {
    throw new CustomError('Authentication Error', '인증번호가 일치하지 않습니다.', { statusCode: 400 });
  }
}
