import mongoose from 'mongoose';

import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Post, { Schedule } from '../models/schemas/Post.js';
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
  // checkSchedulePlaceAndDistances,
  getCommonAggregate,
  getCommonAggregateByUserId,
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
  const [post, schedules] = await Promise.all([
    Post.findOne({ _id: postId })
      .populate({
        path: 'authorId',
        select: '_id nickname profileImageSrc',
      })
      .lean(),
    Schedule.find({ postId }),
  ]).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });

  if (schedules.length) {
    post.schedules = schedules;
  }

  return post;
}

//특정 사용자의 게시글 조회
export async function getAllPostsByUserId(userId) {
  const posts = await Post.aggregate(getCommonAggregateByUserId(userId)).catch((error) => {
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
  files,
) {
  // 사용자가 선택한 태그들이 기존에 제공된 태그인지 검사
  checkTagListHasTag(tag);

  // 사용자가 검색한 여행지가 기존에 제공된 여행지인지 검사
  checkCityListHasCity(destination);

  // // 여행일정과 디데일 일치한지 검사
  // checkScheduleLengthAndDay(schedules, startDate, endDate);

  // 세부 장소와 거리 수가 일치한지 검사
  // checkSchedulePlaceAndDistances(schedules, distances);

  // 세션 시작
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [createdPost] = await Post.create(
      [
        {
          authorId: userId,
          title,
          destination,
          startDate,
          endDate,
          tag,
          distances,
          cost,
          peopleCount,
          isPublic,
          reviewText,
        },
      ],
      { session },
    );

    const newSchedules = schedules.map((schedule) => {
      let src = '';
      if (files.find((file) => file.originalname === schedule.placeName)) {
        src = `/images/${files.find((file) => file.originalname === schedule.placeName).filename}`;
      }

      return {
        postId: createdPost._id,
        ...schedule,
        placeImageSrc: src ? src : 'default',
      };
    });

    // 받은 배열을 한번에 저장한다.
    await Schedule.insertMany(newSchedules, { session });
    createdPost.schedules = newSchedules;

    await session.commitTransaction();
    return createdPost;
  } catch (error) {
    await session.abortTransaction();
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  } finally {
    session.endSession();
  }
}

// 특정 사용자의 게시글 수정 (해당 사용자가 수정하는게 맞는지 확인 필수)
export async function updatePost(
  userId,
  postId,
  files,
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

  // // post가 있는지 확인
  // checkPost(post);

  // 작성자와 수정하려는 사용자가 일치한지
  checkUserId(post, userId);

  // // 시용자가 선택한 태그들이 기존에 제공된 태그인지 검사
  // checkTagListHasTag(tag);

  // // 시용자가 검색한 여행지가 기존에 제공된 여행지인지 검사
  // checkCityListHasCity(destination);

  // 여행일정과 디데일 일치한지 검사
  // checkScheduleLengthAndDay(schedules, startDate, endDate);

  // 세부 장소와 거리 수가 일치한지 검사
  // checkSchedulePlaceAndDistances(schedules, distances);

  // files에 넘어온 데이터로 placeImageSrc를 업데이트 시킨다.
  const newSchedules = schedules.map((schedule) => {
    // files 가 없을 경우 (업데이트 된 사진이 없을 때)
    if (!files.length) {
      // files는 없지만 schedule이 달라질때, (사진 없을때 포함, 사진이 있다면 files가 있을때로 넘어갈 것.)

      return { postId, ...schedule }; // 아무것도 안하고 그냥 반환한다.
    }

    // files가 있을때, (업데이트 된 사진이 있을 때)
    if (files.length > 0) {
      // files 배열을 순회 해서 file의 originalname과 schedule의 placeName이 일치하는것만 업데이트.
      const file = files.find((file) => file.originalname === schedule.placeName);
      return file ? { postId, ...schedule, placeImageSrc: `/images/${file.filename}` } : { postId, ...schedule };
    }
  });

  // 기존 Schedule 은 지운다.
  await Schedule.deleteMany({ postId });

  //  배열을 한번에 저장한다.
  await Schedule.insertMany(newSchedules);

  const updatedPost = await Post.updateOne(
    { _id: postId },
    {
      title,
      destination,
      startDate,
      endDate,
      tag,
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

  // await Comment.deleteMany({ postId: { $in: postId } })
  //   .lean()
  //   .catch((error) => {
  //     throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
  //       statusCode: 500,
  //       cause: error,
  //     });
  //   });

  // await Like.deleteMany({ postId: { $in: postId } })
  //   .lean()
  //   .catch((error) => {
  //     throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
  //       statusCode: 500,
  //       cause: error,
  //     });
  //   });

  // await Bookmark.deleteMany({ postId: { $in: postId } })
  //   .lean()
  //   .catch((error) => {
  //     throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
  //       statusCode: 500,
  //       cause: error,
  //     });
  //   });

  Promise.all([
    await Comment.deleteMany({ postId: { $in: postId } })
      .lean()
      .catch((error) => {
        throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
          statusCode: 500,
          cause: error,
        });
      }),

    await Like.deleteMany({ postId: { $in: postId } })
      .lean()
      .catch((error) => {
        throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
          statusCode: 500,
          cause: error,
        });
      }),

    await Bookmark.deleteMany({ postId: { $in: postId } })
      .lean()
      .catch((error) => {
        throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
          statusCode: 500,
          cause: error,
        });
      }),

    await Post.deleteOne({ _id: postId }).catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    }),

    await Schedule.deleteMany({ postId }).catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    }),
  ]);
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
