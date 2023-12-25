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

  const bookmarks = await bookmarkService.getAllBookmarksByUserId(userId);

  return res.status(200).json({ bookmarks });
}

// 특정 사용자의 북마크 추가
export async function createBookmark(req, res) {
  const userId = req.userId;
  const singleScheduleId = req.body.singleScheduleId;
  const postId = req.body.postId;

  if (!userId) {
    throw new CustomError(commonError.USER_UNKNOWN_ERROR, '추가하려는 특정 사용자를 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  if (!singleScheduleId) {
    throw new CustomError(
      commonError.SCHEDULE_UNKNOWN_ERROR,
      '추가하려는 해당 스케쥴의 고유 아이디값을 찾을 수 없습니다.',
      {
        statusCode: 404,
      },
    );
  }

  if (!postId) {
    throw new CustomError(
      commonError.POST_UNKNOWN_ERROR,
      '추가하려는 해당 게시글의 고유 아이디값을 찾을 수 없습니다.',
      {
        statusCode: 404,
      },
    );
  }

  // 추가하려는 여행장소가 기존에 있는 여행 장소인지 확인
  const result = await bookmarkService.getSingleScheduleIdByPostId(postId, singleScheduleId);

  if (!result) {
    throw new CustomError(commonError.SCHEDULE_EXIST_ERROR, '추가하려는 여행 장소를 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  const createResult = await bookmarkService.createBookmark(userId, singleScheduleId, postId);

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
  const bookmarkIds = req.body.bookmarkId;

  if (!userId) {
    throw new CustomError(commonError.USER_UNKNOWN_ERROR, '삭제하려는 특정 사용자를 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  if (!singleScheduleId) {
    throw new CustomError(
      commonError.BOOKMARK_UNKNOWN_ERROR,
      '삭제하려는 해당 북마크의 고유 아이디값을 찾을 수 없습니다.',
      {
        statusCode: 404,
      },
    );
  }

  const deletedBookmark = await bookmarkService.deleteBookmarks(userId, bookmarkIds);

  if (deletedBookmark === 0) {
    throw new CustomError(commonError.POST_DELETE_ERROR, '북마크가 존재하지 않아 삭제에 실패하였습니다', {
      statusCode: 404,
    });
  }

  return res.status(204);
}
