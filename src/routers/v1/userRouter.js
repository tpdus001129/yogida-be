import express from 'express';
import * as userController from '../../controllers/userController.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import validator from '../../middleware/validator.js';
import { checkEmail, checkNickname, updateUser } from '../../middleware/validators/user.js';
import { profileUploader } from '../../middleware/uploader.js';
import { isAuth } from '../../middleware/isAuth.js';
const userRouter = express.Router();

// 특정 유저 조회
userRouter.get('/:userId', asyncHandler(userController.getUserById));

// // 자기 자신 정보 수정
userRouter.put('/', isAuth, profileUploader(updateUser), asyncHandler(userController.updateUser));

// 닉네임 중복 확인
userRouter.post('/check/nickname', validator(checkNickname), asyncHandler(userController.checkNickname));

// 이메일 중복 확인
userRouter.post('/check/email', validator(checkEmail), asyncHandler(userController.checkEmail));

export default userRouter;
