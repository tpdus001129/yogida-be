import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Like from '../models/schemas/Like.js';

// 1. 찜한 코스 전체 조회
export async function getAllLikedPosts(userId) {
  const likePostIds = await Like.find({ userId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
  return likePostIds;
}

// 2. 특정 게시물에 찜하기
export async function createLike(userId, postId) {
  const createdLike = await Like.create({ userId, postId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
  return createdLike;
}

// 3. 특정 게시물에 찜 취소
export async function deleteLike(userId, postId) {
  const like = await Like.deleteOne({ userId, postId });
  if (!like) {
    throw new CustomError(commonError.LIKE_DELETE_ERROR, '찜 취소를 실패했습니다.', {
      statusCode: 404,
    });
  }
}

// 4. 찜하기 전체 취소
export async function deleteAllLikes(userId) {
  const likes = await Like.deleteMany({ userId });
  if (!likes) {
    throw new CustomError(commonError.LIKE_DELETE_ERROR, '찜 전체 취소를 실패했습니다.', {
      statusCode: 404,
    });
  }
}
