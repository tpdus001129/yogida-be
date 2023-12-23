import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Post from '../models/schemas/Post.js';
// import Like from '../models/schemas/Like.js';
import {
  checkPost,
  checkUserId,
  checkTagListIncludedTag,
  checkCityListIncludedCity,
  checkScheduleLengthAndDay,
  checkSchedulePlaceAndDistances,
} from '../utils/post.js';

// 모든 게시글 조회
export async function getAllPosts() {
  return await Post.find({}).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}

// 특정 게시글 조회
export async function getPostByPostId(postId) {
  return await Post.findOne({ _id: postId })
    .populate({ path: 'authorId', select: '_id nickname' })
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });
}

//특정 사용자의 게시글 조회
export async function getAllPostsByUserId(userId) {
  return await Post.find({ authorId: userId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}

// 태그 필터링된 게시글 조회
export async function getAllPostsByTags(tags) {
  // 배열인지 검사
  if (!Array.isArray(tags)) {
    throw new CustomError(commonError.POST_TYPE_ERROR, '올바른 요청 값이 아닙니다.', {
      statusCode: 404,
    });
  }

  // 시용자가 선택한 태그들이 기존에 제공된 태그인지 검사
  await checkTagListIncludedTag(tags);

  // 전체 게시글에서 해당 태그가 있는 게시글만 반환
  return await Post.find({ tag: { $in: tags } }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}

// 최신순으로 게시글 조회
export async function getPostsByLatest() {
  return await Post.find({})
    .sort({ updatedAt: -1 })
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });
}

// 오래된 순으로 게시글 조회
export async function getPostsByOldest() {
  return await Post.find({})
    .sort({ updatedAt: 1 })
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });
}

// 찜 많은 순으로 게시글 조회
// export async function getPostsByMostLike() {

// }

// 검색된 여행지로 게시글 조회
export async function getAllPostsByDestination(city) {
  return await Post.find({ destination: city }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}

// 게시글 추가
export async function createPost(
  userId,
  {
    title,
    destination,
    startDate,
    endDate,
    tag,
    schedules,
    distances,
    cost,
    peopleCount,
    // likeCount,
    isPublic,
    reviewText,
  },
) {
  // 시용자가 선택한 태그들이 기존에 제공된 태그인지 검사
  await checkTagListIncludedTag(tag);

  // 시용자가 검색한 여행지가 기존에 제공된 여행지인지 검사
  await checkCityListIncludedCity(destination);

  // 여행일정과 디데일 일치한지 검사
  await checkScheduleLengthAndDay(schedules, startDate, endDate);

  // 세부 장소와 거리 수가 일치한지 검사
  await checkSchedulePlaceAndDistances(schedules, distances);

  return await Post.create({
    authorId: userId,
    title,
    destination,
    startDate,
    endDate,
    tag,
    schedules,
    distances,
    cost,
    peopleCount,
    // likeCount,
    isPublic,
    reviewText,
  }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}

// 특정 사용자의 게시글 수정 (해당 사용자가 수정하는게 맞는지 확인 필수)
export async function updatePost(
  userId,
  postId,
  { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText },
) {
  const post = await Post.findOne({ _id: postId }).lean();

  // post가 있는지 확인
  await checkPost(post);

  // 작성자와 수정하려는 사용자가 일치한지
  await checkUserId(post, userId);

  // 시용자가 선택한 태그들이 기존에 제공된 태그인지 검사
  await checkTagListIncludedTag(tag);

  // 시용자가 검색한 여행지가 기존에 제공된 여행지인지 검사
  await checkCityListIncludedCity(destination);

  // 여행일정과 디데일 일치한지 검사
  await checkScheduleLengthAndDay(schedules, startDate, endDate);

  // 세부 장소와 거리 수가 일치한지 검사
  await checkSchedulePlaceAndDistances(schedules, distances);

  const updatedPost = await Post.updateOne(
    { _id: postId },
    {
      title,
      destination,
      startDate,
      endDate,
      tag,
      schedules,
      distances,
      cost,
      peopleCount,
      isPublic,
      reviewText,
    },
  ).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
  if (updatedPost.modifiedCount === 0) {
    throw new CustomError(commonError.POST_MODIFY_ERROR, '게시글 수정을 실패하였습니다.', { statusCode: 404 });
  }

  return updatedPost;
}

// 특정 사용자의 게시글 삭제
export async function deletePost(userId, postId) {
  const post = await Post.findOne({ _id: postId }).lean();

  // post가 있는지 확인
  await checkPost(post);

  // 작성자와 수정하려는 사용자가 일치한지
  await checkUserId(userId);

  return await Post.deleteOne({ _id: postId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}
