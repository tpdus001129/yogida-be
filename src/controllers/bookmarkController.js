import * as bookmarkService from '../services/bookmarkService';

export async function getAllBookmarksById(req, res, next) {
  try {
    const userId = req.userId;
    const bookmarks = await bookmarkService.getAllBookmarksById(userId);

    res.status(200).json({
      status: 200,
      bookmarks,
    });
  } catch (err) {
    next(err);
  }
}

export async function createBookmark(req, res, next) {
  try {
    const { _id } = req.params;
    const bookmarkItem = req.body;
    const result = await bookmarkService.createBookmark({ _id, bookmarkItem });

    if (!result) {
      return res.status(400).json({ status: 400, message: '해당 북마크를 찾을 수 없습니다.' });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteAllBookmarks(req, res, next) {
  try {
    const bookmarkList = req.body;
    await bookmarkService.deleteAllBookmarks(bookmarkList);

    res.status(200).json({
      status: 200,
      message: '북마크 전체 삭제 성공',
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteBookmarkById(req, res, next) {
  try {
    const { _id } = req.params;
    const bookmark = await bookmarkService.deleteBookmarkById(_id);

    if (bookmark === null) {
      return res.status(404).json({ status: 400, message: '해당 게시글이 존재하지 않습니다.' });
    }

    res.status(200).json({
      status: 200,
      message: '게시글 삭제 성공',
    });
  } catch (err) {
    next(err);
  }
}
