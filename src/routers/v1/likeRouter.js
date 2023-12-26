import express from 'express';
import * as likeController from '../../controllers/likeController.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { isAuth } from '../../middleware/isAuth.js';
const router = express.Router();

// 찜한 코스 전체 조회
router.get('/', isAuth, asyncHandler(likeController.getAllLikedPosts));

// 특정 게시물에 찜하기
router.post('/', isAuth, asyncHandler(likeController.createLike));

// 찜 삭제
router.patch('/', isAuth, asyncHandler(likeController.deleteAllLikes));

export default router;
