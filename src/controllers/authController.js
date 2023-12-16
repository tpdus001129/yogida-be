import config from '../config/config.js';
import axios from 'axios';
import * as authService from '../services/authService.js';
import * as userService from '../services/userService.js';
import { createToken } from '../utils/jwt.js';

// 로그인 URL 넘겨주는 함수 (인가 코드 요청 함수)
export async function kakaoLogin(req, res) {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${config.kakao.auth.restApiKey}&redirect_uri=${config.kakao.auth.redirectUri}&response_type=code&prompt=login`;

  return res.status(200).json({ redirectUrl: kakaoAuthURL });
}

// 받은 인가 코드로 토큰 발급해주는 함수
export async function kakaoAuthRedirectHandler(req, res) {
  // 카카오 로그인후 redirect_uri 에 code를 받아온다.
  const data = await getAccessToken(req.query.code);
  // 받은 access 토큰으로 유저 정보를 가져온다.
  const userInfo = await getKakaoUserInfo(data.access_token);

  const { email } = userInfo.kakao_account;
  const { nickname } = userInfo.kakao_account.profile;

  // 데이터 베이스에서 회원 가입 이력이 있는지 확인한다.
  const user = await userService.getUserBySnsId(userInfo.id);

  if (!user) {
    // 가입된 이력이 없다면 가입한다.
    const token = await authService.snsSignup(userInfo.id, email, 'random', nickname);
    console.log('가입하고 발급받은 토큰!', token);

    res.cookie('token', token, {
      httpOnly: true,
    });
    return res.status(302).redirect(process.env.CLIENT_URI);
  }

  // 가입된 유저라면 토큰 생성하고 쿠키에 세팅한 뒤 리다이렉트 시킨다.
  console.log('이미 가입된 계정');

  const token = createToken(email, nickname);
  res.cookie('token', token, {
    httpOnly: true,
  });
  return res.status(302).redirect(process.env.CLIENT_URI);
}

// 회원가입
export async function signup(req, res) {
  const { email, password, nickname } = req.body;
  const token = await authService.signup(email, password, nickname);

  res.cookie('token', token);
  return res.status(201).json({ msg: '회원가입 성공' });
}

// 유저에게 인증메일 보내기
export async function authEmail(req, res) {
  console.log(`[authEmail]`);
  await authService.sendEmail(req.body.email);
  return res.status(200).end();
}

// 인증메일 체크하기
export async function checkEmailCode(req, res) {
  console.log(`[checkEmail]`);

  const { email, authCode } = req.body;
  await authService.checkEmailCode({ email, authCode });

  return res.status(200).end();
}

// 로그인
export async function login(req, res) {
  // body에서 이메일, 패스워드를 받아온다.
  const { email, password } = req.body;

  const token = await authService.login(email, password);

  res.cookie('token', token, {
    httpOnly: true,
  });
  return res.status(201).json({ msg: '로그인 성공' });
}

// 비밀번호 변경 하기
export async function changePassword(req, res) {
  const { email, password } = req.body;
  await authService.updatePassword(email, password);
  return res.status(200).end();
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
