import express from 'express';
import * as authController from '../../controllers/authController.js';
import asyncHandler from '../../middleware/asyncHandler.js';

const authRouter = express.Router();

// 카카오 로그인 요청
authRouter.get('/oauth', asyncHandler(authController.kakaoLogin));

// 카카오 로그인 리다이렉트 요청
authRouter.get('/oauth/redirect', asyncHandler(authController.kakaoAuthRedirectHandler));

// 회원가입
authRouter.post('/signup', asyncHandler(authController.signup));

// 인증 메일 보내기
authRouter.post('/signup/auth-mail', asyncHandler(authController.authEmail));

// 인증 번호 확인
authRouter.post('/signup/check-mail', asyncHandler(authController.checkEmailCode));

// 로그인
authRouter.post('/login', asyncHandler(authController.login));

// 비밀번호 변경
authRouter.post('/change-password', asyncHandler(authController.changePassword));

// 로그인 아웃
// authRouter.post('/logout', authController.logout);

export default authRouter;
