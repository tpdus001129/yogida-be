import Bookmark from '../models/schemas/Bookmark.js';

// 에러 핸들러
function handleError(message) {
  throw new Error(message);
}

// 특정 사용자의 모든 즐겨찾기 조회
export async function getAllBookmarksByUserId(userId) {
  try {
    return await Bookmark.find({ userId }).populate('travelPlace');
  } catch (err) {
    handleError(err.msg);
  }
}

// 특정 사용자의 즐겨찾기 추가
export async function createBookmark(userId, singleScheduleId) {
  try {
    return await Bookmark.create({ userId }, ...singleScheduleId);
  } catch (err) {
    handleError(err.msg);
  }
}

// 특정 유저의 즐겨찾기 전체 삭제
export async function deleteAllBookmark(bookmarkIds) {
  if (!bookmarkIds) {
    handleError('즐겨찾기 정보가 없습니다.');
  }
  try {
    await Bookmark.deleteMany({ _id: { $in: bookmarkIds } });
  } catch (err) {
    handleError(err.msg);
  }
}

// 특정 사용자가 선택한 즐겨찾기 삭제
export async function deleteBookmarkById(userId, bookmarkIds) {
  try {
    return await Bookmark.findByIdAndDelete({ userId, bookmarkIds });
  } catch (err) {
    handleError(err.msg);
  }
}
