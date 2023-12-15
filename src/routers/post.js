import express from 'express';
import v1Router from './v1/index.js';

const router = express.Router();

router.use('/v1', v1Router);

// 전체 게시글 조회
router.get();

// 특정 게시글 조회
router.get();

// 게시글 세부 일정 조회
router.get();

// 게시글 생성
router.post();

// 게시글 수정
router.update();

// 게시글 전체 삭제
router.delete();

// 게시글 선택 삭제
router.delete();

export default router;
