import * as likeService from '../services/likeService.js';

// 찜한 코스 전체 조회
export async function getLikedPosts(req, res) {
  const { postId } = req.params;
  try {
    const likedPosts = await likeService.getLikedPosts(postId);
    if (!likedPosts) {
      return res.status(204).send();
    }
    res.status(200).json(likedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 특정 게시물에 찜하기
export async function createLike(req, res) {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    const like = await likeService.createLike(userId, postId);
    res.status(201).json(like);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 특정 게시물에 찜 취소
export async function deleteLike(req, res) {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    await likeService.deleteLike(userId, postId);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 찜하기 전체 취소
export async function deleteAllLike(req, res) {
  const { userId } = req.body;
  try {
    await likeService.deleteAllLike(userId);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
