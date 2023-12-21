import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import * as commentService from '../services/commentService.js';

// 1. 마이페이지에서 내가 썼던 댓글 조회
export async function getAllCommentsByUserId(req, res) {
  // const authorId = req.userId;
  const authorId = '658147ffc84ca272c761ec03';
  const myComments = await commentService.getAllCommentsByUserId(authorId);

  res.status(200).json({ myComments });
}

// 2. 게시물에 있는 댓글 조회
export async function getCommentsByPostId(req, res) {
  console.log('파람', req.params);
  console.log('쿼리', req.query);
  const postId = req.params.postId;
  const postComments = await commentService.getCommentsByPostId(postId);

  res.status(200).json({ postComments });
}

// 3. 특정 게시물에 댓글 작성
export async function createComment(req, res) {
  // const authorId = req.userId;
  const authorId = '658147ffc84ca272c761ec03';
  const { postId, content, parentComment } = req.body;

  let newComment;
  if (parentComment) {
    newComment = await commentService.createComment(authorId, postId, content, parentComment); // 대댓글
  } else {
    newComment = await commentService.createComment(authorId, postId, content); // 댓글
  }

  res.status(201).json(newComment);
}

// 4. 특정 게시물에 작성한 댓글 수정
export async function updateComment(req, res) {
  // const authorId = req.userId;
  const authorId = '658147ffc84ca272c761ec03';
  const commentId = req.params.commentId;
  const content = req.body;

  const updatedComment = await commentService.updateComment(commentId, authorId, content);
  console.log(updatedComment);

  if (!updatedComment) {
    throw new CustomError(commonError.COMMENT_UNKNOWN_ERROR, '해당 댓글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  res.status(200).json(updatedComment);
}

// 5. 특정 게시물에 작성한 댓글 삭제
export async function deleteComment(req, res) {
  // const authorId = req.userId;
  const authorId = '658147ffc84ca272c761ec03';
  const commentId = req.params.commentId;

  const deletedComment = await commentService.deleteComment(authorId, commentId);
  if (!deletedComment) {
    throw new CustomError(commonError.COMMENT_DELETE_ERROR, '댓글 삭제를 실패하였습니다.', {
      statusCode: 404,
    });
  }

  res.status(204).json(deletedComment);
}
