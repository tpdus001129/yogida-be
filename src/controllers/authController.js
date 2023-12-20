import config from '../config/config.js';
import axios from 'axios';
import * as authService from '../services/authService.js';
import * as userService from '../services/userService.js';
import CustomError from '../middleware/errorHandler.js';
import { createToken } from '../utils/jwt.js';

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
    return res.status(302).redirect(`http://localhost:5173`);
  } else {
    // 없다면 회원가입 페이지로 리다이렉트
    res.cookie('accessToken', data.access_token, {
      httpOnly: true,
    });
    console.log('엑세스 토큰은 ? - ', data.access_token);
    // 추가 정보 받는 페이지로 리다이렉트~
    return res.status(302).redirect(`http://localhost:5173/signup`);
  }
}

// 회원가입
export async function signup(req, res) {
  const { email, password, nickname, type } = req.body;
  const accessToken = req.cookies.accessToken;
  const userInfo = await getKakaoUserInfo(accessToken);

  console.log(userInfo);

  let token;
  if (type === 'kakao') {
    token = await authService.snsSignup(userInfo.id, email, nickname);
  } else {
    token = await authService.signup(email, password, nickname);
  }

  res.cookie('token', token, {
    httpOnly: true,
  });
  return res.status(201).json({ message: '회원가입 성공' });
}

// 유저에게 인증메일 보내기
export async function authEmail(req, res) {
  await authService.sendAuthenticationEmail(req.body.email);
  return res.status(200).json({ message: '전송 완료' });
}

// 인증메일 체크하기
export async function checkEmailCode(req, res) {
  const { email, authCode } = req.body;
  await authService.checkEmailCode({ email, authCode });

  return res.status(200).json({ message: '인증번호 일치' });
}

// 로그인
export async function login(req, res) {
  // body에서 이메일, 패스워드를 받아온다.
  const { email, password } = req.body;

  const token = await authService.login(email, password, 'email');

  res.cookie('token', token, {
    httpOnly: true,
  });
  return res.status(201).json({ message: '로그인 성공' });
}

// 비밀번호 변경 하기
export async function changePassword(req, res) {
  const userId = req.userId; // 요청한 유저의 userId
  const { email, password } = req.body;

  const user = await userService.getUserByEmail(email);

  if (user._id.toString() !== userId.toString()) {
    throw new CustomError('Password Change Error', '다른 유저의 비밀번호는 변경 할 수 없습니다.', { statusCode: 403 });
  }

  await authService.changePassword(email, password);
  return res.status(200).json({ message: '변경 완료' });
}

// 로그인 상태 체크
export async function me(req, res) {
  console.log(req.user);
  console.log(req.userId);

  return res.status(200).json({ user: req.user, userId: req.userId });
}

// 카카오 정보 요청
export async function kakaoMe(req, res) {
  const accessToken = req.cookies.accessToken;
  console.log(req.cookies);
  // console.log(accessToken);

  if (!(await isValidAccessToken(accessToken))) {
    throw new CustomError('Access Token Error', '엑세스 토큰이 유효하지 않습니다.', { statusCode: 401 });
  }

  const userInfo = await getKakaoUserInfo(accessToken);
  const { email } = userInfo.kakao_account;
  const { nickname, profile_image_url: profileImageUrl } = userInfo.kakao_account.profile;

  return res.status(200).json({ email, nickname, profileImageUrl });
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

  const response = await axios.post(`https://kauth.kakao.com/oauth/token`, bodyData, { headers });
  return response.data;
}

// 엑세스 토큰으로 사용자 정보 받아오는 함수
async function getKakaoUserInfo(accessToken) {
  const info = await axios('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return info.data;
}

// 엑세스 토큰의 유효성 검증하는 함수
async function isValidAccessToken(accessToken) {
  console.log(accessToken);
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
        console.error(err.message);
        throw new CustomError('Token Error', '토큰이 유효하지 않습니다.', { statusCode: 401 });
      }
    });
}
