import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import * as bookmarkService from '../services/bookmarkService.js';

// 특정 사용자의 모든 북마크 조회
export async function getAllBookmarksByUserId(req, res) {
  const userId = req.userId;

  if (!userId) {
    throw new CustomError(commonError.USER_UNKNOWN_ERROR, '조회하려는 특정 사용자를 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  const bookmarkedSchedules = await bookmarkService.getAllBookmarksByUserId(userId);

  return res.status(200).json({ bookmarkedSchedules });
}

// 특정 사용자의 북마크 추가
export async function createBookmark(req, res) {
  const userId = req.userId;
  const { singleScheduleId: scheduleId, postId } = req.body;

  const createResult = await bookmarkService.createBookmark(userId, scheduleId, postId);

  if (!createResult) {
    throw new CustomError(commonError.BOOKMARK_CREATE_ERROR, '북마크 추가를 실패했습니다.', {
      statusCode: 404,
    });
  }

  return res.status(201).json({ massage: '북마크 추가되었습니다.' });
}

// 특정 유저의 북마크 삭제
export async function deleteBookmarks(req, res) {
  const userId = req.userId;
  const { singleScheduleIds } = req.body;

  if (!userId) {
    throw new CustomError(commonError.USER_UNKNOWN_ERROR, '삭제하려는 특정 사용자를 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  if (!singleScheduleIds) {
    throw new CustomError(
      commonError.BOOKMARK_UNKNOWN_ERROR,
      '삭제하려는 해당 북마크의 고유 아이디값을 찾을 수 없습니다.',
      {
        statusCode: 404,
      },
    );
  }

  const deletedBookmarks = await bookmarkService.deleteBookmarks(userId, singleScheduleIds);
  if (deletedBookmarks.deletedCount === 0) {
    throw new CustomError(commonError.POST_DELETE_ERROR, '삭제가 실행되었으나 삭제된 데이터가 없습니다.', {
      statusCode: 404,
    });
  }

  return res.status(204).send();
}
