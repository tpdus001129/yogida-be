import * as postService from '../services/postService.js';

const userId = '658147ffc84ca272c761ec03';

// 모든 게시글 조회
export async function getAllPosts(req, res) {
  const posts = await postService.getAllPosts();

  if (!posts) {
    return res.status(200).json({ message: '전체 게시글을 찾을 수 없습니다.' });
  }

  res.status(200).json({ posts });
}

// 특정 게시글 조회
export async function getPostByPostId(req, res) {
  const postId = req.params.postId;
  const post = await postService.getPostByPostId(postId);

  if (!post) {
    return res.status(404).json({ message: '해당 게시글을 찾을 수 없습니다.' });
  }

  return res.status(200).json({ message: '해당 게시글이 조회되었습니다.' });
}

// 게시글 추가
export async function createPost(req, res) {
  const { title, destination, startDate, endDate, tag, schedules, distances, cost, peopleCount, isPublic, reviewText } =
    req.body;

  await postService.createPost(userId, {
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

  res.status(201).json({ message: '게시글이 등록되었습니다.' });
}

// 특정 사용자의 게시글 수정
export async function updatePost(req, res) {
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
    return res.status(404).json({ message: '해당 게시글을 찾을 수 없습니다.' });
  }

  return res.status(201).json({ message: '게시글이 수정되었습니다.' });
}

// 특정 사용자의 게시글 삭제
export async function deletePost(req, res) {
  const postId = req.params.postId;
  const post = await postService.deletePost(userId, postId);

  if (post === null) {
    return res.status(404).json({ message: '해당 게시글이 존재하지 않습니다.' });
  }

  res.status(204).json({ message: '게시글 삭제 성공' });
}
