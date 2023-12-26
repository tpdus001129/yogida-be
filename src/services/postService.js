import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Post from '../models/schemas/Post.js';
import {
  checkPost,
  checkUserId,
  checkTagListHasTag,
  checkCityListHasCity,
  checkSortListHasSort,
  checkScheduleLengthAndDay,
  checkSchedulePlaceAndDistances,
  getCommonAggregate,
} from '../utils/post.js';

/// 모든 게시글 조회
export async function getAllPosts() {
  const posts = await Post.aggregate(getCommonAggregate()).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });

  return posts;
}

// 특정 게시글 조회
export async function getPostById(postId) {
  return await Post.findOne({ _id: postId })
    .populate({ path: 'authorId', select: '_id nickname' })
    .lean()
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });
}

//특정 사용자의 게시글 조회
export async function getAllPostsByUserId(userId) {
  return await Post.find({ authorId: userId })
    .lean()
    .catch((error) => {
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
      statusCode: 400,
    });
  }

  if (tags.length > 5) {
    throw new CustomError(commonError.TAG_COUNT_ERROR, '태그는 최대 5개까지 선택 가능합니다.', {
      statusCode: 400,
    });
  }

  // 시용자가 선택한 태그들이 기존에 제공된 태그인지 검사
  checkTagListHasTag(tags);

  // 전체 게시글에서 해당 태그가 있는 게시글만 반환
  return await Post.aggregate([...getCommonAggregate(), { $match: { tag: { $in: tags } } }]).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}

// 검색된 여행지로 게시글 조회
export async function getAllPostsByDestination(city) {
  checkCityListHasCity(city);

  return await Post.aggregate([...getCommonAggregate(), { $match: { destination: city } }]).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}

export async function getPostsBySort(sort, posts) {
  // 사용자가 선택한 정렬 기준이 기존에 제공된 기준인지 검사
  checkSortListHasSort(sort);

  if (sort === '최신순') {
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === '오래된순') {
    return posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    //찜많은순으로 정렬
    return posts.sort((a, b) => b.likeCount - a.likeCount);
  }
}

// 게시글 추가
export async function createPost(
  userId,
  { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText },
) {
  // 사용자가 선택한 태그들이 기존에 제공된 태그인지 검사
  checkTagListHasTag(tag);

  // 사용자가 검색한 여행지가 기존에 제공된 여행지인지 검사
  checkCityListHasCity(destination);

  // 여행일정과 디데일 일치한지 검사
  checkScheduleLengthAndDay(schedules, startDate, endDate);

  // 세부 장소와 거리 수가 일치한지 검사
  checkSchedulePlaceAndDistances(schedules, distances);

  const createdPost = await Post.create({
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
    isPublic,
    reviewText,
  });

  return createdPost;
}

// 특정 사용자의 게시글 수정 (해당 사용자가 수정하는게 맞는지 확인 필수)
export async function updatePost(
  userId,
  postId,
  { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText },
) {
  const post = await Post.findOne({ _id: postId })
    .lean()
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });

  // post가 있는지 확인
  checkPost(post);

  // 작성자와 수정하려는 사용자가 일치한지
  checkUserId(post, userId);

  // 시용자가 선택한 태그들이 기존에 제공된 태그인지 검사
  checkTagListHasTag(tag);

  // 시용자가 검색한 여행지가 기존에 제공된 여행지인지 검사
  checkCityListHasCity(destination);

  // 여행일정과 디데일 일치한지 검사
  checkScheduleLengthAndDay(schedules, startDate, endDate);

  // 세부 장소와 거리 수가 일치한지 검사
  checkSchedulePlaceAndDistances(schedules, distances);

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
  const post = await Post.findOne({ _id: postId })
    .lean()
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });

  // post가 있는지 확인
  checkPost(post);

  // 작성자와 수정하려는 사용자가 일치한지
  checkUserId(userId);

  return await Post.deleteOne({ _id: postId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}
