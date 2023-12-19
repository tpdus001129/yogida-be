import express from 'express';
import * as postController from '../../controllers/postController.js';
import asyncHandler from '../../middleware/asyncHandler.js';

const postRouter = express.Router();

// 전체 게시글 조회 (메인페이지)
postRouter.get('/', asyncHandler(postController.getAllPost));

// 게시글 세부 일정 조회 (상세페이지)
postRouter.get('/:id', asyncHandler(postController.getPostById));

// 게시글 생성
postRouter.post('/', asyncHandler(postController.createPost));

// 게시글 수정
postRouter.put('/:id', asyncHandler(postController.updatePost));

// 게시글 삭제
postRouter.delete('/:id', asyncHandler(postController.deletePostById));

export default postRouter;
