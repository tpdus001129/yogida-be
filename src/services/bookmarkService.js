import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Bookmark from '../models/schemas/Bookmark.js';

// 특정 사용자의 모든 즐겨찾기 조회
export async function getAllBookmarksByUserId(userId) {
  return await Bookmark.find({ userId })
    .populate('travelPlace')
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });
}

// 특정 사용자의 즐겨찾기 추가
export async function createBookmark(userId, singleScheduleId) {
  return await Bookmark.create(userId, singleScheduleId).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}

// 특정 유저의 즐겨찾기 전체 삭제
export async function deleteAllBookmarks(userId, bookmarkIds) {
  if (!bookmarkIds) {
    throw new CustomError(commonError.BOOKMARK_UNKNOWN_ERROR, '즐겨찾기를 찾을 수 없습니다.', {
      statusCode: 404,
      cause: error,
    });
  }

  await Bookmark.deleteMany({ _id: { $in: bookmarkIds }, userId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}

// 특정 사용자가 선택한 즐겨찾기 삭제
export async function deleteBookmarkByBookmarkId(bookmarkId) {
  const bookmark = await Bookmark.findOne(bookmarkId).populate('userID');

  if (bookmark.userId !== userId) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '즐겨찾기를 삭제할 권한이 없습니다.', {
      statusCode: 403,
      cause: error,
    });
  }

  return await Bookmark.deleteOne(bookmarkId).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}
