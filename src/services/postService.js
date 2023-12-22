import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Post from '../models/schemas/Post.js';

// 여기다에서 제공되는 태그 목록
const tagList = [
  '체험·엠티비티',
  'SNS 핫플레이스',
  '자연적인',
  '유명 관광지',
  '힐링',
  '문화·예술·역사',
  '맛집 탐방',
  '혼자',
  '친구와',
  '연인과',
  '아이와',
  '부모님과',
  '반려견과',
  '기타',
];

// 여기다에서 제공되는 여행 목록
const cityList = [];

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
  return await Post.findOne({ _id: postId }).catch((error) => {
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

// 받아온 태그 배열, 검색 값이 기존에 제공된 것인지 확인
async function checkListIncludedItem(items, checkList) {
  for (const item of items) {
    if (!checkList.includes(item)) {
      throw new CustomError(commonError.TAG_UNKNOWN_ERROR, '태그를 찾을 수 없습니다.', {
        statusCode: 404,
      });
    }
  }
}

// 태그 필터링된 게시글 조회
export async function getAllPostsByTags(tags) {
  if (!Array.isArray(tags)) {
    throw new CustomError(commonError.POST_TYPE_ERROR, '올바른 요청 값이 아닙니다.', {
      statusCode: 404,
    });
  }

  // 시용자가 선택한 태그들이 기존에 제공된 태그인지 검사
  await checkListIncludedItem(tags, tagList);

  // 전체 게시글에서 해당 태그가 있는 게시글만 반환
  return Post.find({ tag: { $in: tags } }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}

// 게시글 추가
export async function createPost(
  userId,
  { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText },
) {
  // 여행일정과 관련된 변수 설정
  const singleScheduleLength = schedules.length;

  // 세부 장소와 거리에 관련된 변수 설정
  const singleSchedulePlaceCounts = schedules.map((location) => location.length - 1);
  const distancesCounts = distances.map((distance) => distance.length);

  // startDate, endDate Date로 변경
  const stDate = new Date(startDate);
  const edDate = new Date(endDate);

  // 여행일정 수 계산 (5월 30일 ~ 6월 2일이여도 계산 가능)
  const dtMs = edDate.getTime() - stDate.getTime();
  const travelDays = dtMs / (1000 * 60 * 60 * 24) + 1;

  // 등록된 여행 날짜와 디데이 불일치 또는 세부 장소와 거리 갯수 불일치 시 오류 반환
  if (singleScheduleLength !== travelDays) {
    throw new CustomError(commonError.SCHEDULE_MATCH_ERROR, '등록된 여행 날짜와 여행 일정 수가 일치하지 않습니다', {
      statusCode: 404,
    });
  }

  if (singleSchedulePlaceCounts.length !== distancesCounts.length) {
    throw new CustomError(commonError.SCHEDULE_MATCH_ERROR, '등록된 여행 장소 갯수와 거리 갯수가 일치하지 않습니다.', {
      statusCode: 404,
    });
  }

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
  // 작성자와 수정하려는 사용자가 일치한지
  const post = await Post.findOne({ _id: postId }).lean();

  if (!post) {
    throw new CustomError(commonError.POST_NOT_FOUND, '게시글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  if (!post.authorId.equals(userId)) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '게시글을 수정할 권한이 없습니다.', {
      statusCode: 403,
    });
  }

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

  if (!post) {
    throw new CustomError(commonError.POST_NOT_FOUND, '게시글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  // 작성자와 삭제하려는 사용자가 일치한지
  if (post.authorId.toString() !== userId) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '게시글을 삭제할 권한이 없습니다.', {
      statusCode: 403,
    });
  }

  return await Post.deleteOne({ _id: postId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
}
