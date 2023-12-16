import Bookmark from '../models/schemas/bookmark.js';

export async function getAllBookmarksById(userId) {
  try {
    const bookmarks = await Bookmark.find({ userId }).populate('travelPlace').exec();

    if (!bookmarks) {
      return { status: 200, message: '북마크가 없습니다.' };
    }

    return bookmarks;
  } catch (err) {
    throw new Error(err);
  }
}

export async function createBookmark(_id, bookmarkItem) {
  try {
    const bookmark = await Bookmark.create({ _id }, bookmarkItem).exec();

    if (!bookmark) {
      return { status: 400, message: '추가 실패' };
    }

    return bookmark;
  } catch (err) {
    throw new Error(err);
  }
}

export async function deleteBookmarkById(_id) {
  try {
    const bookmark = await Bookmark.findByIdAndDelete({ _id }).exec();

    if (!bookmark) {
      return { status: 400, message: '북마크를 찾을 수 없습니다.' };
    }

    return bookmark;
  } catch (err) {
    throw new Error(err);
  }
}

export async function deleteAllBookmarks(bookmarkList) {
  if (!bookmarkList) {
    throw new Error('북마크 정보가 없습니다.');
  }
  try {
    await Promise.all(
      bookmarkList.map(async (bm) => {
        await Bookmark.deleteOne({ _id: bm }).exec();
      }),
    );
  } catch (err) {
    throw new Error(err);
  }
}
