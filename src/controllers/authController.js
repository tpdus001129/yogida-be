import config from '../config/config.js';
import axios from 'axios';
import * as userService from '../services/userService.js';

// 로그인 URL 넘겨주는 함수
export async function kakaoLogin(req, res) {
  console.log(`/oath/authorize`);
  const response = await axios.get(
    `https://kauth.kakao.com/oauth/authorize?client_id=${config.kakao.auth.restApiKey}&redirect_uri=${config.kakao.auth.redirectUri}&response_type=code&prompt=login`,
  );
  const kakaoAuthURL = response.config.url;
  return res.status(200).json({ redirectUrl: kakaoAuthURL });
}

// 받은 인가 코드로 토큰 발급해주는 함수
export async function getKakaoAccessToken(req, res) {
  const bodyData = {
    grant_type: 'authorization_code',
    client_id: config.kakao.auth.restApiKey,
    redirect_uri: config.kakao.auth.redirectUri,
    code: req.query.code,
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
  };

  const response = await axios.post(`https://kauth.kakao.com/oauth/token`, bodyData, { headers });
  const access_token = response.data.access_token;

  const userInfo = await getKakaoUserInfo(access_token);
  console.log(userInfo);
  // 데이터 베이스에서 회원 가입 이력이 있는지 확인한다. (검증 로직으로)

  // 없으면 추가 정보를 받고 회원가입 시킨다. (회원 데이터로 관리)

  return res.status(200).json({ token: access_token });
}

// 회원가입
export async function signup() {
  // const { email, password, nickname } = req.body;
}

export async function login(req, res) {
  const { email, password, nickname } = req.body;
  const user = await userService.createUser({ email, password, nickname });
  res.status(201).json({ msg: '생성 완료', user });
}

// 인가 토큰으로 개인 이메일과 닉네임 받아오는 함수
async function getKakaoUserInfo(accessToken) {
  // console.log(accessToken);
  const info = await axios('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return info.data;
}
