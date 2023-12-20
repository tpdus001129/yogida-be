import express from 'express';
import * as userController from '../../controllers/userController.js';
import asyncHandler from '../../middleware/asyncHandler.js';

const userRouter = express.Router();

// 특정 유저 조회
userRouter.get('/:userId', asyncHandler(userController.getUserById));

// 닉네임 중복 확인
userRouter.post('/check/nickname', asyncHandler(userController.checkNickname));

// 이메일 중복 확인
userRouter.post('/check/email', asyncHandler(userController.checkEmail));

export default userRouter;
