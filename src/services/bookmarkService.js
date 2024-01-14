import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Bookmark from '../models/schemas/Bookmark.js';
import Post from '../models/schemas/Post.js';

// 특정 사용자의 모든 북마크 조회
export async function getAllBookmarksByUserId(userId) {
  const bookmarks = await Bookmark.find({ userId })
    // .populate({ path: 'postId', model: 'Post', select: 'schedules' })
    .populate('scheduleId')
    .lean()
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });

  return bookmarks;
}

// 사용자가 즐겨찾기로 추가하려는 여행 장소가 실제로 post에 저장되어있는지 확인
export async function getSingleScheduleIdByPostId(postId, singleScheduleId) {
  const post = await Post.findById(postId).lean();
  const singleScheduleIds = post.schedules.flatMap((scheduleList) => scheduleList.map((schedule) => schedule._id));

  return singleScheduleIds.find((s) => s.toString() === singleScheduleId);
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
export async function deleteBookmarks(userId, bookmarkIds) {
  if (!Array.isArray(bookmarkIds)) {
    throw new CustomError(commonError.BOOKMARK_TYPE_ERROR, '올바른 요청 값이 아닙니다.', {
      statusCode: 404,
    });
  }

  if (!bookmarkIds || bookmarkIds.length === 0) {
    throw new CustomError(commonError.BOOKMARK_UNKNOWN_ERROR, '북마크를 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  const bookmarks = await Bookmark.find({ _id: { $in: bookmarkIds } }).lean();

  if (bookmarkIds.length !== bookmarks.length) {
    throw new CustomError(commonError.BOOKMARK_DELETE_ERROR, '해당 북마크가 기존 북마크 목록에 없습니다.', {
      statusCode: 404,
    });
  }

  let deletedCount = 0;

  // 저장한 사용자와 삭제할 사용자가 일치한지 확인 -> 삭제
  for (const bookmark of bookmarks) {
    // console.log()
    if (!bookmark.userId.equals(userId)) {
      // Skip bookmarks with different authorId
      continue;
    }

    await Bookmark.deleteMany({ _id: { $in: bookmarkIds }, userId }).catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });

    deletedCount++;
  }

  if (deletedCount === 0) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '북마크를 삭제할 권한이 없습니다.', {
      statusCode: 403,
    });
  }

  return deletedCount;
}
