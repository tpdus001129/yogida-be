import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Like from '../models/schemas/Like.js';
import Post from '../models/schemas/Post.js';

// 1. 찜한 코스 전체 조회
export async function getAllLikedPosts(userId) {
  const likePostIds = await Like.find({ userId })
    .populate({
      path: 'postId',
      model: 'Post',
      select: 'title startDate endDate schedules',
    })
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });
  return likePostIds;
}

// 2. 특정 게시물에 찜하기
export async function createLike(userId, postId) {
  await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });
  const createdLike = await Like.create({ userId, postId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
  return createdLike;
}

// 3. 찜 삭제
export async function deleteAllLikes(userId, bodyData) {
  const user = Array.isArray(bodyData) ? bodyData.map((item) => item.userId) : [bodyData.userId];
  const post = Array.isArray(bodyData) ? bodyData.map((item) => item.postId) : [bodyData.postId];

  if (!user || post === 0) {
    throw new CustomError(commonError.LIKE_UNKNOWN_ERROR, '찜을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  const userMap = new Map();
  user.forEach((userId) => {
    userMap.set(userId.toString(), true);
  });

  if (!userMap.has(userId.toString())) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '찜을 삭제할 권한이 없습니다.', {
      statusCode: 403,
    });
  }

  for (let i = 0; i < user.length; i++) {
    await Like.deleteMany({ userId: user[i], postId: post[i] }).catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });
  }
}
