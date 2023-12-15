import express from 'express';
import * as postController from '../../controllers/postController.js';

const postRouter = express.Router();

// 전체 게시글 조회 (메인페이지)
postRouter.get('/posts', postController.getAllPost);

// 게시글 세부 일정 조회
postRouter.get('/posts/:id', postController.getPostById);

// 게시글 생성
postRouter.post('/posts', postController.createPost);

// 게시글 수정
postRouter.put('/posts/:id', postController.updatePost);

// 게시글 전체 삭제
postRouter.delete('/posts', postController.deleteAllPosts);

// 게시글 선택 삭제
postRouter.delete('/posts/:id', postController.deletePostById);

export default postRouter;
