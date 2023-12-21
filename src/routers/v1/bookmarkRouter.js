import express from 'express';
import * as bookmarkController from '../../controllers/bookmarkController.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { isAuth } from '../../middleware/isAuth.js';

const bookmarkRouter = express.Router();

// 전체 북마크 조회
bookmarkRouter.get('/', asyncHandler(bookmarkController.getAllBookmarksByUserId));

// 북마크 추가 (req.body: {postId: "some-id"})
// isAuth 추가하기
bookmarkRouter.post('/', asyncHandler(bookmarkController.createBookmark));

// 북마크 전체 삭제
bookmarkRouter.delete('/', asyncHandler(bookmarkController.deleteAllBookmarks));

// 북마크 선택 삭제
bookmarkRouter.delete('/:bookmarkId', asyncHandler(bookmarkController.deleteBookmarkByBookmarkId));

export default bookmarkRouter;
