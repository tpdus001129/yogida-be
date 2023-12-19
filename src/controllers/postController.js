import * as postService from '../services/postService.js';

const userId = 'alsdfj30rwoeijwlkdfl458209735';

// 모든 게시글 조회
export async function getAllPost(req, res) {
  const posts = await postService.getAllPost();

  if (!posts) {
    return res.status(200).json({ message: '전체 게시글을 찾을 수 없습니다.' });
  }

  res.status(200).json({ posts });
}

// 특정 게시글 조회
export async function getPostById(req, res) {
  const postId = req.params.postId;
  const post = await postService.getPostById(postId);

  if (!post) {
    return res.status(404).json({ message: '해당 게시글을 찾을 수 없습니다.' });
  }

  return res.status(200).json({ message: '해당 게시글 조회 성공' });
}

// 게시글 추가
export async function createPost(req, res) {
  try {
    // 유저아이디도 있어야함
    const userId = req.userId;
    const {
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
    } = req.body;

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

    res.status(200).json({
      status: 200,
      message: '게시글 등록 성공',
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: '서버 오류 입니다.',
    });
  }
}

// 특정 사용자의 게시글 수정
export async function updatePost(req, res) {
  try {
    const userId = req.userId;
    const postId = req.params;
    const {
      authorId,
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
    } = req.body;
    const result = await postService.updatePost(userId);

    if (!result) {
      return res.status(400).json({ status: 400, message: '해당 게시글을 찾을 수 없습니다.' });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

// 특정 사용자의 게시글 삭제
export async function deletePostById(req, res) {
  try {
    const { _id } = req.params;
    const post = await postService.deletePostById(_id);

    if (post === null) {
      return res.status(404).json({ status: 400, message: '해당 게시글이 존재하지 않습니다.' });
    }

    res.status(200).json({
      status: 200,
      message: '게시글 삭제 성공',
    });
  } catch (err) {
    next(err);
  }
}
