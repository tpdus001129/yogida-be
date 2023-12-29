import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Post from '../models/schemas/Post.js';
import Bookmark from '../models/schemas/Bookmark.js';
import Comment from '../models/schemas/Comment.js';
import Like from '../models/schemas/Like.js';
import {
  checkPost,
  checkUserId,
  checkTagListHasTag,
  checkCityListHasCity,
  checkSortListHasSort,
  // checkScheduleLengthAndDay,
  checkSchedulePlaceAndDistances,
  getCommonAggregate,
} from '../utils/post.js';

/// 모든 게시글 조회
export async function getAllPosts() {
  const posts = await Post.aggregate([
    {
      $match: {
        isPublic: true, // isPublic이 true인 문서만 선택
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'postId',
        as: 'likes',
      },
    },
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'postId',
        as: 'comments',
      },
    },
    {
      $lookup: {
        from: 'replies',
        localField: '_id',
        foreignField: 'postId',
        as: 'replies',
      },
    },
    {
      $project: {
        authorId: 1,
        title: 1,
        destination: 1,
        startDate: 1,
        endDate: 1,
        tag: 1,
        schedules: 1,
        distances: 1,
        cost: 1,
        peopleCount: 1,
        likeCount: { $size: '$likes' },
        commentCount: { $add: [{ $size: '$comments' }, { $size: '$replies' }] },
        isPublic: 1,
        reviewText: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]).catch((error) => {
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
    .populate({ path: 'authorId', select: '_id nickname profileImageSrc' })
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
  const posts = await Post.find({ authorId: userId })
    .lean()
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });

  posts.sort((a, b) => b.createdAt - a.createdAt);
  return posts;
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

  // // 여행일정과 디데일 일치한지 검사
  // checkScheduleLengthAndDay(schedules, startDate, endDate);

  // 세부 장소와 거리 수가 일치한지 검사
  // checkSchedulePlaceAndDistances(schedules, distances);

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
  }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
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
  // checkScheduleLengthAndDay(schedules, startDate, endDate);

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
  checkUserId(post, userId);

  await Comment.deleteMany({ postId: { $in: postId } })
    .lean()
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });

  await Like.deleteMany({ postId: { $in: postId } })
    .lean()
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });

  await Bookmark.deleteMany({ postId: { $in: postId } })
    .lean()
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });

  return await Post.deleteOne({ _id: postId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}

export async function findPostsByDestinationAndTag(destination, tag, sort) {
  const query = {};

  // 목적지가 주어진 경우 쿼리에 추가
  if (destination) {
    query.destination = destination;
  }
  // 태그가 주어진 경우, 배열 내 해당 태그가 있는지 확인
  if (tag) {
    query.tag = { $in: tag };
  }

  // aggregate 쿼리 설정
  let aggregateQuery = [
    { $match: query },
    ...getCommonAggregate(), // 여기서 likeCount 등을 계산
  ];

  // 정렬 조건 추가
  switch (sort) {
    case '최신순':
      aggregateQuery.push({ $sort: { createdAt: -1 } });
      break;
    case '오래된순':
      aggregateQuery.push({ $sort: { createdAt: 1 } });
      break;
    case '찜많은순':
      aggregateQuery.push({ $sort: { likeCount: -1 } });
      break;
    default:
      // 기본 정렬 로직 (예: 최신순)
      aggregateQuery.push({ $sort: { createdAt: -1 } });
  }

  // Post 모델을 사용하여 aggregate 쿼리 수행
  const posts = await Post.aggregate(aggregateQuery).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });

  return posts;
}
