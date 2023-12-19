import express from 'express';
import * as likeController from '../../controllers/likeController.js';
const router = express.Router();

// 찜한 코스 전체 조회
router.get('/likes', likeController.getLikedPosts);

// 특정 게시물에 찜하기
router.post('/likes/:postId', likeController.createLike);

// 특정 게시물에 찜 취소
router.delete('/likes/:postId', likeController.deleteLike);

// 찜하기 전체 취소
router.delete('/likes', likeController.deleteAllLike);

export default router;
