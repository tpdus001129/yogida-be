import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import * as postService from '../services/postService.js';

// 모든 게시글 조회
export async function getAllPosts(req, res) {
  const result = await postService.getAllPosts();

  return res.status(200).json({ result });
}

// 특정 게시글 조회
export async function getPostByPostId(req, res) {
  const postId = req.params.postId;
  const result = await postService.getPostByPostId(postId);

  if (result === null) {
    throw new CustomError(commonError.POST_UNKNOWN_ERROR, '해당 게시글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  return res.status(200).json({ result });
}

// 특정 사용자의 게시글 조회
export async function getAllPostsByUserId(req, res) {
  const result = await postService.getAllPostsByUserId(userId);

  if (result === null) {
    throw new CustomError(commonError.POST_UNKNOWN_ERROR, '해당 게시글을 찾을 수 없습니다.', {
      statusCode: 200,
    });
  }

  return res.status(200).json({ result });
}

// 태그로 필터링된 게시글 조회
export async function getAllPostsByTags(req, res) {
  const tags = req.query.tag.split(',');

  const result = await postService.getAllPostsByTags(tags);

  return res.status(200).json({ result });
}

// 검색된 여행지로 게시글 조회
export async function getAllPostsByDestination(req, res) {
  const city = req.query.city;

  const result = await postService.getAllPostsByDestination(city);

  return res.status(200).json({ result });
}

// 게시글 추가
export async function createPost(req, res) {
  const userId = req.userId;
  const { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText } =
    req.body;

  const result = await postService.createPost(userId, {
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

  if (!result) {
    throw new CustomError(commonError.POST_UNKNOWN_ERROR, '해당 게시글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  return res.status(201).json({ message: '게시글이 등록되었습니다.' });
}

// 특정 사용자의 게시글 수정
export async function updatePost(req, res) {
  const userId = req.userId;
  const postId = req.params.postId;
  const { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText } =
    req.body;

  const result = await postService.updatePost(userId, postId, {
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

  if (!result) {
    throw new CustomError(commonError.POST_UNKNOWN_ERROR, '해당 게시글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  return res.status(200).json({ message: '게시글이 수정되었습니다.' });
}

// 특정 사용자의 게시글 삭제
export async function deletePost(req, res) {
  const userId = req.userId;
  const postId = req.params.postId;
  const result = await postService.deletePost(userId, postId);

  if (!result) {
    throw new CustomError(commonError.POST_DELETE_ERROR, '게시글 삭제를 실패하였습니다.', {
      statusCode: 404,
    });
  }

  return res.status(200).json({ message: '게시글이 삭제되었습니다.' });
}
