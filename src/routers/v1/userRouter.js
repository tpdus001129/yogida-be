import express from 'express';
import * as userController from '../../controllers/userController.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import validator from '../../middleware/validator.js';
import { checkEmail, checkNickname } from '../../middleware/validators/user.js';
import upload from '../../middleware/uploader.js';
const userRouter = express.Router();

// 특정 유저 조회
userRouter.get('/:userId', asyncHandler(userController.getUserById));

// // 자기 자신 정보 수정
// userRouter.patch(
//   '/',
//   isAuth,
//   validator(updateUser),
//   uploader.single('profile'),
//   asyncHandler(userController.updateUser),
// );

// 유저 생성
userRouter.post('/upload', upload.single('file'), asyncHandler(userController.postUser));

// 닉네임 중복 확인
userRouter.post('/check/nickname', validator(checkNickname), asyncHandler(userController.checkNickname));

// 이메일 중복 확인
userRouter.post('/check/email', validator(checkEmail), asyncHandler(userController.checkEmail));

export default userRouter;
