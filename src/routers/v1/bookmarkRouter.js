import express from 'express';
import * as bookmarkController from '../../controllers/bookmarkController.js';

const bookmarkRouter = express.Router();

// 전체 북마크 조회
bookmarkRouter.get('/users/bookmarks', bookmarkController.getAllBookmarksById);

// 북마크 추가
bookmarkRouter.post('/users/bookmarks/:id', bookmarkController.createBookmark);

// 북마크 전체 삭제
bookmarkRouter.delete('/users/bookmarks', bookmarkController.deleteAllBookmarks);

// 북마크 선택 삭제
bookmarkRouter.delete('/users/bookmarks/:id', bookmarkController.deleteBookmarkById);

export default bookmarkRouter;
