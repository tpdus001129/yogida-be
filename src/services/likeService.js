import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Like from '../models/schemas/Like.js';

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
  const findLike = await Like.findOne({
    userId: userId,
    postId: postId,
  }).lean();

  if (findLike) {
    throw new CustomError(commonError.LIKE_DELETE_ERROR, '이미 찜에 추가되어있습니다.', {
      statusCode: 409,
    });
  }

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
  const deletedLike = await Like.deleteMany({ _id: { $in: bodyData }, userId });
  return deletedLike;
}
