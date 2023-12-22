import express from 'express';
import * as likeController from '../../controllers/likeController.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { isAuth } from '../../middleware/isAuth.js';
const router = express.Router();

// 찜한 코스 전체 조회
router.get('/', isAuth, asyncHandler(likeController.getAllLikedPosts));

// 특정 게시물에 찜하기
router.post('/:postId', isAuth, asyncHandler(likeController.createLike));

// 특정 게시물에 찜 취소
router.delete('/:postId', isAuth, asyncHandler(likeController.deleteLike));

// 찜하기 전체 취소
router.delete('/', isAuth, asyncHandler(likeController.deleteAllLikes));

export default router;
