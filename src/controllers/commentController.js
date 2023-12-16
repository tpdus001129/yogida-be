import * as commentService from '../services/commentService.js';

// 1. 게시물에 있는 댓글 조회
export async function getAllComment(req, res) {
  try {
    const postId = req.params.postId;
    const comments = await commentService.getAllComment(postId);
    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}

// 2. 특정 게시물에 댓글 작성
export async function createComment(req, res) {
  try {
    const { authorId, postId, content, parentComment } = req.body;
    let newComment;
    if (parentComment) {
      newComment = await commentService.createComment(authorId, parentComment, content); // 대댓글
    } else {
      newComment = await commentService.createComment(authorId, postId, content); // 댓글
    }
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}

// 3. 특정 게시물에 작성한 댓글 수정
export async function updateComment(req, res) {
  try {
    const commentId = req.params.commentId;
    const content = req.body.content;

    const updateComment = await commentService.updateComment(commentId, content);
    res.status(200).json(updateComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}

// 4. 특정 게시물에 작성한 댓글 삭제
export async function deleteComment(req, res) {
  try {
    const commentId = req.params.commentId;

    const deleteComment = await commentService.deleteComment(commentId);
    res.status(200).json(deleteComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}
