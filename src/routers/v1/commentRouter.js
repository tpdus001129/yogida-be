import express from 'express';
import * as commentController from '../../controllers/commentController.js';
const router = express.Router();

// 마이페이지에서 내가 썼던 댓글 조회
router.get('/comments', commentController.getAllCommentsByUserId);

// 게시물에 있는 댓글 조회
router.get('/comments/:postId', commentController.getCommentsByPostId);

// 특정 게시물에 댓글 작성
router.post('/comments', commentController.createComment);

// 특정 게시물에 작성한 댓글 수정
router.put('/comments/:commentId', commentController.updateComment);

// 특정 게시물에 작성한 댓글 삭제
router.delete('/comments/:commentId', commentController.deleteComment);

export default router;
