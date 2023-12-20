import express from 'express';
import * as authController from '../../controllers/authController.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { isAuth } from '../../middleware/isAuth.js';

const authRouter = express.Router();

// 카카오 로그인 요청
authRouter.get('/kakao', asyncHandler(authController.kakaoLogin));

// 카카오 로그인 리다이렉트 요청
authRouter.get('/kakao/redirect', asyncHandler(authController.kakaoAuthRedirectHandler));

// 카카오 정보 요청
authRouter.get('/kakao/me', asyncHandler(authController.kakaoMe));

// 회원가입
authRouter.post('/signup', asyncHandler(authController.signup));

// 인증 메일 보내기
authRouter.post('/signup/auth-mail', asyncHandler(authController.authEmail));

// 인증 번호 확인
authRouter.post('/signup/check-mail', asyncHandler(authController.checkEmailCode));

// 로그인
authRouter.post('/login', asyncHandler(authController.login));

// 비밀번호 변경
authRouter.post('/change-password', isAuth, asyncHandler(authController.changePassword));

// 로그인 아웃
// authRouter.post('/logout', authController.logout);

// 로그인 상태 체크
authRouter.get('/me', isAuth, asyncHandler(authController.me));

export default authRouter;
