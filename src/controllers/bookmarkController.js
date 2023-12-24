import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import * as bookmarkService from '../services/bookmarkService.js';

// 특정 사용자의 모든 북마크 조회
export async function getAllBookmarksByUserId(req, res) {
  const userId = req.userId;
  console.log(userId);
  const bookmarks = await bookmarkService.getAllBookmarksByUserId(userId);

  console.log(bookmarks);

  return res.status(200).json({ bookmarks });
}

// 특정 사용자의 북마크 추가
export async function createBookmark(req, res) {
  const userId = req.userId;
  console.log(userId);
  const singleScheduleId = req.body.singleScheduleId;
  const postId = req.body.postId;

  // 추가하려는 여행장소가 기존에 있는 여행 장소인지 확인
  const getResult = await bookmarkService.getSingleScheduleIdByPostId(postId, singleScheduleId);

  if (!getResult) {
    throw new CustomError(commonError.SCHEDULE_EXIST_ERROR, '추가하려는 여행 장소를 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  const createResult = await bookmarkService.createBookmark(userId, singleScheduleId);

  if (!createResult) {
    throw new CustomError(commonError.BOOKMARK_UNKNOWN_ERROR, '북마크를 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  return res.status(201).json({ massage: '북마크 추가되었습니다.' });
}

// 특정 유저의 북마크 삭제
export async function deleteAllBookmarks(req, res) {
  const userId = req.userId;
  const bookmarkIds = req.body.bookmarkId;
  const deletedBookmark = await bookmarkService.deleteAllBookmarks(userId, bookmarkIds);

  if (deletedBookmark === 0) {
    throw new CustomError(commonError.POST_DELETE_ERROR, '북마크 삭제를 실패하였습니다.', {
      statusCode: 404,
    });
  }

  return res.status(200).json({ message: '북마크가 모두 삭제되었습니다.' });
}
