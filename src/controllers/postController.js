import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import * as postService from '../services/postService.js';

// 모든 게시글 조회
export async function getAllPosts(req, res) {
  const posts = await postService.getAllPosts();

  return res.status(200).json({ posts });
}

// 특정 게시글 조회
export async function getPostById(req, res) {
  const postId = req.params.postId;
  const post = await postService.getPostById(postId);

  if (post === null) {
    throw new CustomError(commonError.POST_UNKNOWN_ERROR, '해당 게시글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  return res.status(200).json(post);
}

// 특정 사용자의 게시글 조회
export async function getAllPostsByUserId(req, res) {
  const userId = req.userId;
  const posts = await postService.getAllPostsByUserId(userId);

  return res.status(200).json({ posts });
}

// 태그로 필터링된 게시글 조회
export async function getAllPostsByTags(req, res) {
  const tags = req.query.tag.split(',');

  const posts = await postService.getAllPostsByTags(tags);

  return res.status(200).json({ posts });
}

// 최신순으로 게시글 조회
export async function getPostsByLatest(req, res) {
  const posts = await postService.getPostsByLatest();

  return res.status(200).json({ posts });
}

// 오래된 순으로 게시글 조회
export async function getPostsByOldest(req, res) {
  const posts = await postService.getPostsByOldest();

  return res.status(200).json({ posts });
}

// 찜 많은 순으로 게시글 조회
export async function getPostsByMostLike(req, res) {
  const posts = await postService.getPostsByMostLike();

  return res.status(200).json({ posts });
}

// 검색된 여행지로 게시글 조회
export async function getAllPostsByDestination(req, res) {
  const city = req.query.city;

  const posts = await postService.getAllPostsByDestination(city);

  return res.status(200).json({ posts });
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
    throw new CustomError(commonError.POST_UNKNOWN_ERROR, '이미 같은 ID로 게시글이 등록되어 있습니다.', {
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
    throw new CustomError(commonError.POST_DELETE_ERROR, '해당 게시글이 존재하지 않아 삭제할 수 없습니다', {
      statusCode: 404,
    });
  }

  return res.status(204);
}
