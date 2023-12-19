import * as bookmarkService from '../services/bookmarkService.js';

// 특정 사용자의 모든 즐겨찾기 조회
export async function getAllBookmarksByUserId(req, res) {
  // 쿠키로 저장한 사용자 아이디를 가져온다면 req.userId로
  const userId = req.userId;
  const bookmarks = await bookmarkService.getAllBookmarksByUserId(userId);

  if (bookmarks.length === 0) {
    throw new Error('즐겨찾기를 찾을 수 없습니다.');
  }

  return res.status(200).json({ bookmarks });
}

// 특정 사용자의 즐겨찾기 추가
export async function createBookmark(req, res) {
  // 쿠키로 저장한 사용자 아이디를 가져온다면 req.userId로
  const userId = req.userId;
  // postId? singleScheduleId?
  const singleScheduleId = req.body.singleScheduleId;
  const result = await bookmarkService.createBookmark(userId, singleScheduleId);

  if (result === null) {
    throw new Error('해당 즐겨찾기를 찾을 수 없습니다.');
  }

  return res.status(200).json({ msg: '즐겨찾기 추가 성공' });
}

// 특정 유저의 즐겨찾기 전체 삭제
export async function deleteAllBookmarks(req, res) {
  // 쿠키로 저장한 사용자 아이디를 가져온다면 req.userId로
  const userId = req.userId;
  const bookmarkIds = req.body;
  const result = await bookmarkService.deleteAllBookmark(userId, bookmarkIds);

  if (!result) {
    throw new Error('전체 즐겨찾기를 찾을 수 없거나 삭제할 권한이 없습니다.');
  }

  res.status(200).json({ msg: '유저의 즐겨찾기 전체 삭제 성공' });
}

// 특정 사용자가 선택한 즐겨찾기 삭제
export async function deleteBookmarkById(req, res) {
  const userId = req.userId;
  const bookmarkIds = req.body;
  const result = await bookmarkService.deleteBookmarkById(userId, bookmarkIds);

  if (!result) {
    throw new Error('해당 즐겨찾기를 찾을 수 없거나 삭제할 권한이 없습니다.');
  }

  res.status(200).json({ msg: '유저가 선택한 즐겨찾기 삭제 성공' });
}
