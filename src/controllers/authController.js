import config from '../config/config.js';
import axios from 'axios';
import * as authService from '../services/authService.js';
import * as userService from '../services/userService.js';
import CustomError from '../middleware/errorHandler.js';
import { createToken } from '../utils/jwt.js';
import commonError from '../constants/errorConstant.js';
import { jsonParser } from '../utils/common.js';

// 로그인 URL 넘겨주는 함수 (인가 코드 요청 함수)
export async function kakaoLogin(req, res) {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${config.kakao.auth.restApiKey}&redirect_uri=${config.kakao.auth.redirectUri}&response_type=code&prompt=login`;
  return res.status(302).redirect(kakaoAuthURL);
}

// 받은 인가 코드로 토큰 발급해주는 함수
export async function kakaoAuthRedirectHandler(req, res) {
  // 카카오 로그인후 redirect_uri 에 code를 받아온다.
  const data = await getAccessToken(req.query.code);
  // 받은 access 토큰으로 유저 정보를 가져온다.
  const userInfo = await getKakaoUserInfo(data.access_token);

  const { email } = userInfo.kakao_account;
  const { nickname } = userInfo.kakao_account.profile;

  // email로 가입되어있는 유저인지 확인한다.
  const user = await userService.getUserByEmail(email);

  // 있다면 바로 로그인 (토큰을 쿠키에 담아 메인페이지로 리다이렉트 한다.)
  if (user) {
    const token = createToken(email, nickname);
    res.cookie('token', token, {
      httpOnly: true,
    });
    return res.status(302).redirect(config.host.clientUri);
  } else {
    // 없다면 회원가입 페이지로 리다이렉트
    res.cookie('accessToken', data.access_token, {
      httpOnly: true,
    });
    // 추가 정보 받는 페이지로 리다이렉트~
    return res.status(302).redirect(`${config.host.clientUri}/setup`);
  }
}

// 회원가입
export async function signup(req, res) {
  const payload = req.body.payload;

  const parsedPayload = jsonParser(payload);

  const { snsId, email, password, nickname, type, profileImageSrc: image } = parsedPayload;

  let token;
  let profileImageSrc;

  if (req.file) {
    // profileImageSrc = `/images/${req.file.filename}`;
    // multer-s3용 코드
    profileImageSrc = `${req.file.location}`;
  } else {
    if (type === 'kakao') profileImageSrc = image;
  }

  if (type === 'kakao') {
    token = await authService.snsSignup(snsId, email, nickname, profileImageSrc);
  } else {
    token = await authService.signup(email, password, nickname, profileImageSrc);
  }

  // 여기서 auth에 email로 찾아서 삭제한다.

  await authService.deleteAuthCode(email);
  res.clearCookie('accessToken');
  res.cookie('token', token, {
    httpOnly: true,
  });
  return res.status(201).json({ message: '회원가입 성공' });
}

// 유저에게 인증메일 보내기
export async function sendAuthEmail(req, res) {
  const { email, type } = req.body;
  await authService.sendAuthenticationEmail(email, type);
  return res.status(200).json({ message: '전송 완료' });
}

// 인증메일 체크하기
export async function checkEmailCode(req, res) {
  const { email, authCode } = req.body;
  await authService.checkEmailCode({ email, authCode });
  // 인증에 성공하면 토큰을 발급
  const token = createToken(email, null, 300_000);
  res.cookie('token', token, {
    httpOnly: true,
  });
  return res.status(200).json({ message: '인증번호 일치' });
}

// 로그인
export async function login(req, res) {
  // body에서 이메일, 패스워드를 받아온다.
  const { email, password } = req.body;

  const { token, user } = await authService.login(email, password, 'email');

  res.cookie('token', token, {
    httpOnly: true,
  });
  return res.status(201).json({ message: '로그인 성공', user });
}

// 비밀번호 변경 하기
export async function changePassword(req, res) {
  const userId = req.userId; // 요청한 유저의 userId
  const { email, password } = req.body;

  const user = await userService.getUserByEmail(email);

  if (user._id.toString() !== userId.toString()) {
    throw new CustomError('Password Change Error', '다른 유저의 비밀번호는 변경 할 수 없습니다.', { statusCode: 403 });
  }
  res.clearCookie('token');
  await authService.changePassword(email, password);
  return res.status(200).json({ message: '변경 완료' });
}

// 로그아웃
export async function logout(req, res) {
  res.clearCookie('token');
  return res.status(200).json({ message: '로그아웃 성공' });
}

// 로그인 상태 체크
export async function me(req, res) {
  return res.status(200).json({ user: req.user, userId: req.userId });
}

// 카카오 정보 요청
export async function kakaoMe(req, res) {
  const accessToken = req.cookies.accessToken;

  if (!(await isValidAccessToken(accessToken))) {
    throw new CustomError('Access Token Error', '엑세스 토큰이 유효하지 않습니다.', { statusCode: 401 });
  }

  const userInfo = await getKakaoUserInfo(accessToken);
  const snsId = userInfo.id.toString();
  const { email } = userInfo.kakao_account;
  const { nickname, profile_image_url: profileImageUrl } = userInfo.kakao_account.profile;
  return res.status(200).json({ snsId, email, nickname, profileImageUrl });
}

// 카카오 연결 끊기
export async function kakaoUnlink(req, res) {
  const userId = req.userId;
  const snsId = req.user.snsId;
  const bodyData = {
    target_id_type: 'user_id',
    target_id: snsId,
  };
  const result = await axios
    .post('https://kapi.kakao.com/v1/user/unlink', bodyData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        Authorization: `KakaoAK ${config.kakao.auth.appAdminKey}`,
      },
    })
    .catch((err) => {
      throw new CustomError(commonError.KAKAO_API_ERROR, '탈퇴하는데 알수 없는 에러가 생겼습니다.', {
        statusCode: 500,
        cause: err,
      });
    });

  await userService.deleteUser(userId);
  res.clearCookie('token');
  return res.status(200).json({ message: '연결 해제 성공', snsId: result.data.id });
}

export async function withdraw(req, res) {
  const userId = req.userId;

  await userService.deleteUser(userId);
  res.clearCookie('token');
  return res.status(200).json({ message: '탈퇴 성공' });
}

// 엑세스 토큰 받아오는 함수
async function getAccessToken(code) {
  const bodyData = {
    grant_type: 'authorization_code',
    client_id: config.kakao.auth.restApiKey,
    redirect_uri: config.kakao.auth.redirectUri,
    code,
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
  };

  const response = await axios.post(`https://kauth.kakao.com/oauth/token`, bodyData, { headers }).catch((err) => {
    throw new CustomError(commonError.KAKAO_API_ERROR, '토큰을 발급 받는 중 알 수 없는 에러가 생겼습니다.', {
      statusCode: 500,
      cause: err,
    });
  });
  return response.data;
}

// 엑세스 토큰으로 사용자 정보 받아오는 함수
async function getKakaoUserInfo(accessToken) {
  const info = await axios('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).catch((err) => {
    throw new CustomError(commonError.KAKAO_API_ERROR, '사용자 정보를 요청 하는 중 알 수 없는 에러가 생겼습니다.', {
      statusCode: 500,
      cause: err,
    });
  });

  return info.data;
}

// 엑세스 토큰의 유효성 검증하는 함수
async function isValidAccessToken(accessToken) {
  return await axios('https://kapi.kakao.com/v1/user/access_token_info', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    })
    .catch((err) => {
      if (err.response.status === 401) {
        throw new CustomError(commonError.KAKAO_API_ERROR, '토큰이 유효하지 않습니다.', {
          statusCode: 401,
          cause: err,
        });
      }
    });
}
