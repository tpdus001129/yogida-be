import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Bookmark from '../models/schemas/Bookmark.js';

// 특정 사용자의 모든 북마크 조회
export async function getAllBookmarksByUserId(userId) {
  const bookmarkedSchedules = await Bookmark.find({ userId })
    .populate('scheduleId')
    .lean()
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });

  return bookmarkedSchedules;
}

// 특정 사용자의 북마크 추가
export async function createBookmark(userId, scheduleId, postId) {
  const findBookmark = await Bookmark.findOne({
    userId,
    scheduleId,
    postId,
  }).lean();

  if (findBookmark) {
    throw new CustomError(commonError.BOOKMARK_CREATE_ERROR, '이미 북마크에 추가되어있습니다.', {
      statusCode: 409,
    });
  }

  return await Bookmark.create({ userId, scheduleId, postId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}

// 특정 유저의 북마크 삭제
export async function deleteBookmarks(userId, singleScheduleIds) {
  const deletedBookmarks = await Bookmark.deleteMany({ _id: { $in: singleScheduleIds }, userId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });

  return deletedBookmarks;
}
