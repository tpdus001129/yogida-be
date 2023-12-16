import Like from '../models/schemas/like.js';
import Post from '../models/schemas/post.js';

// 내가 한 좋아요의 게시물 리스트 조회
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

// 특정 게시물에 좋아요
export async function createLike(userId, postId) {
  try {
    const like = await Like.create({ userId, postId });
    console.log(like);
  } catch (error) {
    console.error(error);
    throw new Error('좋아요를 실패했습니다.');
  }
}

// 특정 게시물에 좋아요 취소
export async function deleteLike(userId, postId) {
  try {
    const unlike = await Like.findOneAndDelete({ userId, postId });
    console.log(unlike);
  } catch (error) {
    console.error(error);
    throw new Error('좋아요 취소를 실패했습니다.');
  }
}
