import express from 'express';
import * as bookmarkController from '../../controllers/bookmarkController.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { isAuth } from '../../middleware/isAuth.js';

const bookmarkRouter = express.Router();

// 전체 북마크 조회
bookmarkRouter.get('/', isAuth, asyncHandler(bookmarkController.getAllBookmarksByUserId));

// 북마크 추가 (req.body: {postId: "some-id"})
bookmarkRouter.post('/', isAuth, asyncHandler(bookmarkController.createBookmark));

// 북마크 삭제
bookmarkRouter.delete('/', isAuth, asyncHandler(bookmarkController.deleteAllBookmarks));

export default bookmarkRouter;
