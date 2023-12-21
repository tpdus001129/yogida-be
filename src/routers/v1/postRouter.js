import express from 'express';
import * as postController from '../../controllers/postController.js';
import asyncHandler from '../../middleware/asyncHandler.js';
// import { isAuth } from '../../middleware/isAuth.js';

const postRouter = express.Router();

// 전체 게시글 조회 (메인페이지)
postRouter.get('/', asyncHandler(postController.getAllPosts));

// 게시글 세부 일정 조회 (상세페이지)
postRouter.get('/:postId', asyncHandler(postController.getPostByPostId));

// 특정 사용자의 전체 게시글 조회
postRouter.get('/:userId', asyncHandler(postController.getAllPostsByUserId));

// 게시글 생성
// isAuth 추가하기
postRouter.post('/', asyncHandler(postController.createPost));

// 게시글 수정
postRouter.put('/:postId', asyncHandler(postController.updatePost));

// 게시글 삭제
postRouter.delete('/:postId', asyncHandler(postController.deletePost));

export default postRouter;
