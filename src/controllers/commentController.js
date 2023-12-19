import * as commentService from '../services/commentService.js';

// 1. 마이페이지에서 내가 썼던 댓글 조회
export async function getMyComments(req, res) {
  try {
    const authorId = req.userId;
    const myComments = await getMyComments(authorId);
    res.status(200).json({ myComments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

// 2. 게시물에 있는 댓글 조회
export async function getComments(req, res) {
  try {
    const postId = req.params.postId;
    const comments = await commentService.getComments(postId);
    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

// 3. 특정 게시물에 댓글 작성
export async function createComment(req, res) {
  try {
    const authorId = req.userId;
    const { postId, content, parentComment } = req.body;

    let newComment;
    if (parentComment) {
      newComment = await commentService.createComment(authorId, parentComment, content); // 대댓글
    } else {
      newComment = await commentService.createComment(authorId, postId, content); // 댓글
    }
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

// 4. 특정 게시물에 작성한 댓글 수정
export async function updateComment(req, res) {
  try {
    const authorId = req.userId;
    const commentId = req.params.commentId;
    const content = req.body.content;

    const updatedComment = await commentService.updateComment(authorId, commentId, content);
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

// 5. 특정 게시물에 작성한 댓글 삭제
export async function deleteComment(req, res) {
  try {
    const authorId = req.userId;
    const commentId = req.params.commentId;

    const deletedComment = await commentService.deleteComment(authorId, commentId);
    res.status(200).json(deletedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
