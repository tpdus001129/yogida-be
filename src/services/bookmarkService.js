import Bookmark from '../models/schemas/Bookmark.js';

// 특정 사용자의 모든 즐겨찾기 조회
export async function getAllBookmarksByUserId(userId) {
  try {
    return await Bookmark.find({ userId }).populate('travelPlace');
  } catch (err) {
    throw new Error(err.message);
  }
}

// 특정 사용자의 즐겨찾기 추가
export async function createBookmark(userId, singleScheduleId) {
  try {
    return await Bookmark.create({ userId }, ...singleScheduleId);
  } catch (err) {
    throw new Error(err.message);
  }
}

// 특정 유저의 즐겨찾기 전체 삭제
export async function deleteAllBookmarks(userId, bookmarkIds) {
  if (!bookmarkIds) {
    throw new Error('즐겨찾기 정보가 없습니다.');
  }
  try {
    await Bookmark.deleteMany({ _id: { $in: bookmarkIds }, userId });
  } catch (err) {
    throw new Error(err.message);
  }
}

// 특정 사용자가 선택한 즐겨찾기 삭제
export async function deleteBookmarkByBookmarkId(bookmarkId) {
  try {
    return await Bookmark.deleteOne(bookmarkId);
  } catch (err) {
    throw new Error(err.message);
  }
}
