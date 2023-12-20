import Like from '../models/schemas/Like.js';
import Post from '../models/schemas/Post.js';

// 찜한 코스 전체 조회
export async function getAllLike(userId) {
  try {
    const likePosts = await Like.find({ userId }).select('postId');
    const postId = likePosts.map((like) => like.postId);
    const likePostData = await Post.find({ _id: { $in: postId } });
    return likePostData;
  } catch (error) {
    console.error(error);
    throw new Error('찜한 코스 조회를 실패했습니다.');
  }
}

// 특정 게시물에 찜하기
export async function createLike(userId, postId) {
  try {
    await Like.create({ userId, postId });
  } catch (error) {
    console.error(error);
    throw new Error('찜을 실패했습니다.');
  }
}

// 특정 게시물에 찜 취소
export async function deleteLike(userId, postId) {
  try {
    await Like.findOneAndDelete({ userId, postId });
  } catch (error) {
    console.error(error);
    throw new Error('찜 취소를 실패했습니다.');
  }
}

// 찜하기 전체 취소
export async function deleteAllLike(userId) {
  try {
    await Like.deleteMany({ userId });
  } catch (error) {
    console.error(error);
    throw new Error('찜하기 전체 취소를 실패했습니다.');
  }
}
