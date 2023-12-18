import * as likeService from '../services/likeService.js';

// 찜한 코스 전체 조회
export async function getAllLike(req, res) {
  const { postId } = req.params;
  try {
    const likePosts = await likeService.getAllLike(postId);
    if (!likePosts) {
      res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
      return;
    }
    res.status(200).json(likePosts);
  } catch (error) {
    res.status(500).json({ error: error });
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
    res.status(500).json({ error: error });
  }
}

// 특정 게시물에 찜 취소
export async function deleteLike(req, res) {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    const unlike = await likeService.deleteLike(userId, postId);
    res.status(200).json(unlike);
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

// 찜하기 전체 취소
export async function deleteAllLike(req, res) {
  const { userId } = req.body;
  try {
    const allUnlike = await likeService.deleteAllLike(userId);
    res.status(200).json(allUnlike);
  } catch (error) {
    res.status(500).json({ error: error });
  }
}
