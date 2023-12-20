import Like from '../models/schemas/Like.js';
import Post from '../models/schemas/Post.js';

// 1. 찜한 코스 전체 조회
export async function getAllLikedPosts(userId) {
  try {
    const likePostIds = await Like.find({ userId }).distinct('postId');
    const likePostData = await Post.find({ _id: { $in: likePostIds } }).lean();
    return likePostData;
  } catch (error) {
    console.error(error);
    throw new Error('찜한 코스 조회를 실패했습니다.');
  }
}

// 2. 특정 게시물에 찜하기
export async function createLike(userId, postId) {
  try {
    const createdLike = await Like.create({ userId, postId });
    return createdLike._id;
  } catch (error) {
    console.error(error);
    throw new Error('찜을 실패했습니다.');
  }
}

// 3. 특정 게시물에 찜 취소
export async function deleteLike(userId, postId) {
  try {
    await Like.deleteOne({ userId, postId });
  } catch (error) {
    console.error(error);
    throw new Error('찜 취소를 실패했습니다.');
  }
}

// 4. 찜하기 전체 취소
export async function deleteAllLikes(userId) {
  try {
    await Like.deleteMany({ userId });
  } catch (error) {
    console.error(error);
    throw new Error('찜하기 전체 취소를 실패했습니다.');
  }
}
