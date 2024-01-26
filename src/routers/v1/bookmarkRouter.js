import express from 'express';
import * as bookmarkController from '../../controllers/bookmarkController.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { isAuth } from '../../middleware/isAuth.js';
import validator from '../../middleware/validator.js';
import { createBookmark, deleteBookmarks } from '../../middleware/validators/bookmark.js';

const bookmarkRouter = express.Router();

// 전체 북마크 조회
bookmarkRouter.get('/', isAuth, asyncHandler(bookmarkController.getAllBookmarksByUserId));
bookmarkRouter.get('/test/by-id', isAuth, asyncHandler(bookmarkController.test));

// 북마크 추가 (req.body: {postId: "some-id"})
bookmarkRouter.post('/', isAuth, validator(createBookmark), asyncHandler(bookmarkController.createBookmark));

// 북마크 삭제
bookmarkRouter.patch('/', isAuth, validator(deleteBookmarks), asyncHandler(bookmarkController.deleteBookmarks));

export default bookmarkRouter;
