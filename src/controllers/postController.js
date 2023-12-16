import * as postService from '../services/postService.js';

export async function getAllPost(req, res, next) {
  try {
    const posts = await postService.getAllPosts();

    res.json({
      status: 200,
      posts,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPostById(req, res, next) {
  try {
    const { _id } = req.params;
    const post = await postService.getPostById(_id);

    if (!post) {
      return res.status(400).json({ status: 400, message: '해당 게시글을 찾을 수 없습니다.' });
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
}

export async function createPost(req, res) {
  try {
    const postProps = req.body;
    await postService.createPost(postProps);

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

export async function updatePost(req, res, next) {
  try {
    const { _id } = req.params;
    const postData = req.body;
    const result = await postService.updatePost(_id, postData);

    if (!result) {
      return res.status(400).json({ status: 400, message: '해당 게시글을 찾을 수 없습니다.' });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteAllPosts(req, res, next) {
  try {
    const postList = req.body;
    await postService.deleteAllPosts(postList);

    res.status(200).json({
      status: 200,
      message: '게시글 전체 삭제 성공',
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePostById(req, res, next) {
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
