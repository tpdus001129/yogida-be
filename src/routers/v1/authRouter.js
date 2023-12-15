import express from 'express';
import * as authController from '../../controllers/authController.js';

const authRouter = express.Router();

// 카카오 로그인 요청
authRouter.get('/oauth', authController.kakaoLogin);

// 카카오 로그인 리다이렉트 요청
authRouter.get('/oauth/redirect', authController.getKakaoAccessToken);

// 회원가입
authRouter.post('/auth/signup', authController.signup);

// 로그인
authRouter.post('/auth/login', authController.login);

// 로그인 아웃
// authRouter.post('/auth/logout', authController.logout);

export default authRouter;
