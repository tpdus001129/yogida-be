import express from 'express';
import * as commentController from '../../controllers/commentController.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import validator from '../../middleware/validator.js';
import { createComment, updateComment } from '../../middleware/validators/comment.js';
import { isAuth } from '../../middleware/isAuth.js';
const router = express.Router();

// 마이페이지에서 내가 썼던 댓글 조회
router.get('/mine', isAuth, asyncHandler(commentController.getAllCommentsByUserId));

// 게시물에 있는 댓글 조회
router.get('/', asyncHandler(commentController.getCommentsByPostId));

// 특정 게시물에 댓글 작성
router.post('/', isAuth, validator(createComment), asyncHandler(commentController.createComment));

// 특정 게시물에 작성한 댓글 수정
router.patch('/:commentId', isAuth, validator(updateComment), asyncHandler(commentController.updateComment));

// 특정 게시물에 작성한 대댓글 수정
router.patch('/reply/:commentId', isAuth, validator(updateComment), asyncHandler(commentController.updateReply));

// 특정 게시물에 작성한 댓글 삭제
router.delete('/:commentId', isAuth, asyncHandler(commentController.deleteComment));

// 특정 게시물에 작성한 대댓글 삭제
router.delete('/reply/:commentId', isAuth, asyncHandler(commentController.deleteReply));

export default router;
