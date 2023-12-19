import * as likeService from '../services/likeService.js';

// 1. 찜한 코스 전체 조회
export async function getLikedPosts(req, res) {
  const userId = req.userId;
  try {
    const likedPosts = await likeService.getLikedPosts(userId);
    res.status(200).json({ likedPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

// 2. 특정 게시물에 찜하기
export async function createLike(req, res) {
  const userId = req.userId;
  const postId = req.params.postId;
  try {
    const like = await likeService.createLike(userId, postId);
    res.status(201).json(like);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 3. 특정 게시물에 찜 취소
export async function deleteLike(req, res) {
  const userId = req.userId;
  const postId = req.params.postId;
  try {
    await likeService.deleteLike(userId, postId);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 4. 찜하기 전체 취소
export async function deleteAllLike(req, res) {
  const userId = req.userId;
  try {
    await likeService.deleteAllLike(userId);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
