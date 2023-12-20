import * as bookmarkService from '../services/bookmarkService.js';

const userId = '658147ffc84ca272c761ec03';

// 특정 사용자의 모든 즐겨찾기 조회
export async function getAllBookmarksByUserId(req, res) {
  const bookmarks = await bookmarkService.getAllBookmarksByUserId(userId);

  if (bookmarks.length === 0) {
    throw new Error('즐겨찾기를 찾을 수 없습니다.');
  }

  return res.status(200).json({ bookmarks });
}

// 특정 사용자의 즐겨찾기 추가
export async function createBookmark(req, res) {
  // postId? singleScheduleId?
  const singleScheduleId = req.body.singleScheduleId;
  const result = await bookmarkService.createBookmark(userId, singleScheduleId);

  if (result === null) {
    throw new Error('해당 즐겨찾기를 찾을 수 없습니다.');
  }

  return res.status(201).json({ massage: '즐겨찾기 추가되었습니다.' });
}

// 특정 유저의 즐겨찾기 전체 삭제
export async function deleteAllBookmarks(req, res) {
  const bookmarkIds = req.body;
  const result = await bookmarkService.deleteAllBookmarks(userId, bookmarkIds);

  if (!result) {
    throw new Error('즐겨찾기가 존재하지 않습니다.');
  }

  res.status(204).json({ message: '해당 사용자의 즐겨찾기가 모두 삭제되었습니다.' });
}

// 특정 사용자가 선택한 즐겨찾기 삭제
export async function deleteBookmarkByBookmarkId(req, res) {
  const bookmarkId = req.params.bookmarkId;
  const result = await bookmarkService.deleteBookmarkByBookmarkId(userId, bookmarkId);

  if (!result) {
    throw new Error('해당 즐겨찾기를 찾을 수 없거나 삭제할 권한이 없습니다.');
  }

  res.status(204).json({ message: '해당 사용자가 선택한 즐겨찾기가 삭제되었습니다.' });
}
